const express = require('express');
const crypto = require('crypto');
const db = require('../config/db'); // Импортируем подключение к БД
const auth = require('../middleware/authMiddleware'); // Добавляем middleware авторизации

// Use global fetch if available (Node 18+), otherwise lazy-load
const fetch = (...args) =>
    (globalThis.fetch
        ? globalThis.fetch(...args)
        : import('node-fetch').then(({ default: f }) => f(...args)));

const router = express.Router();

const {
    FONDY_MERCHANT_ID,
    FONDY_SECRET,
    FONDY_API_URL,
    APP_URL,
    API_URL,
} = process.env;

function createSignature(data) {
    const keys = Object.keys(data).filter((k) => {
        const v = data[k];
        if (k === 'response_signature_string') return false;
        return v !== undefined && v !== null && v !== '';
    });
    keys.sort();
    const values = keys.map((k) => String(data[k]));
    const signatureString = [FONDY_SECRET, ...values].join('|');
    return crypto.createHash('sha1').update(signatureString).digest('hex');
}

async function createFondySessionOnce(intAmount, uniqueOrderId) {
    const apiUrl = API_URL || 'http://localhost:8080';

    const payload = {
        merchant_id: FONDY_MERCHANT_ID,
        order_id: uniqueOrderId,
        order_desc: 'Покупка картин',
        currency: 'UAH',
        amount: intAmount,
        response_url: `${apiUrl}/api/fondy/return`,
        server_callback_url: `${apiUrl}/api/fondy/webhook`,
    };

    payload.signature = createSignature(payload);

    const fondyResponse = await fetch(
        (FONDY_API_URL || 'https://api.fondy.eu') + '/api/checkout/url/',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request: payload }),
        }
    ).then((r) => r.json());

    return fondyResponse;
}

// Добавляем auth middleware, чтобы знать User_ID
router.post('/create-session', auth, async(req, res) => {
    try {
        const { amount, paintingIds } = req.body; // Ожидаем массив paintingIds с фронта
        const userId = req.session.user?.Creator_ID || req.session.user?.id;

        if (!amount || !paintingIds || !paintingIds.length) {
            return res.status(400).json({ error: 'amount_or_paintings_missing' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const intAmount = Math.round(Number(amount) * 100);

        // Генерируем ID заказа
        const uniqueOrderId = 'order_' + crypto.randomBytes(16).toString('hex');

        // Сохраняем заказ в БД перед отправкой в Fondy
        await db.query('INSERT INTO payment_orders (Order_ID, User_ID, Status) VALUES (?, ?, ?)',
            [uniqueOrderId, userId, 'pending']);

        // Сохраняем состав заказа
        const orderItemsValues = paintingIds.map(pid => [uniqueOrderId, pid]);
        await db.query('INSERT INTO payment_order_items (Order_ID, Painting_ID) VALUES ?', [orderItemsValues]);

        // Создаем сессию в Fondy
        let attempts = 0;
        let fondyResponse = null;

        while (attempts < 3) {
            attempts += 1;
            fondyResponse = await createFondySessionOnce(intAmount, uniqueOrderId);
            const resp = fondyResponse?.response;
            if (!resp) break;

            const code = resp.error_code;
            const msg = resp.error_message;

            // 1013 — дубликат order_id, пробуем создать новый
            if (code === 1013 || code === '1013' ||
                (msg && typeof msg === 'string' && msg.indexOf('Duplicate order') !== -1)) {
                console.warn(
                    'Fondy duplicate order_id, retrying with new order_id, attempt',
                    attempts,
                    'of 3'
                );
                continue;
            }

            // Любая другая ошибка — выходим, не повторяем
            break;
        }

        return res.json(fondyResponse);
    } catch (err) {
        console.error('Error creating Fondy session:', err);
        return res.status(500).json({ error: 'fondy_create_session_failed' });
    }
});

router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const data = req.body || {};
        const receivedSignature = data.signature;
        const dataWithoutSignature = { ...data };
        delete dataWithoutSignature.signature;

        const expectedSignature = createSignature(dataWithoutSignature);
        if (!receivedSignature || expectedSignature !== receivedSignature) {
            return res.status(400).send('invalid signature');
        }

        const orderId = data.order_id;
        const orderStatus = data.order_status;

        console.log(`Fondy webhook: Order ${orderId} status ${orderStatus}`);

        if (orderStatus === 'approved') {
            // 1. Обновляем статус заказа
            await db.query('UPDATE payment_orders SET Status = ? WHERE Order_ID = ?', ['approved', orderId]);

            // 2. Получаем пользователя и картины из этого заказа
            const [orderRows] = await db.query('SELECT User_ID FROM payment_orders WHERE Order_ID = ?', [orderId]);
            const [itemRows] = await db.query('SELECT Painting_ID FROM payment_order_items WHERE Order_ID = ?', [orderId]);

            if (orderRows.length > 0 && itemRows.length > 0) {
                const userId = orderRows[0].User_ID;
                const paintingIds = itemRows.map(row => row.Painting_ID);

                // 3. Добавляем в покупки пользователя (user_purchases), игнорируя дубликаты (INSERT IGNORE)
                const values = paintingIds.map(pid => [userId, pid]);
                await db.query('INSERT IGNORE INTO user_purchases (User_ID, Painting_ID) VALUES ?', [values]);

                console.log(`Purchases recorded for User ${userId}, Items: ${paintingIds}`);
            }
        }

        return res.send('OK');
    } catch (err) {
        console.error('Error in Fondy webhook:', err);
        return res.sendStatus(500);
    }
});

router.all('/return', express.urlencoded({ extended: false }), (req, res) => {
    // В local/dev среде внешнему вебхуку часто недоступен localhost.
    // Поэтому дублируем основную логику фиксации покупки и здесь, в /return.
    try {
        const appUrl = APP_URL || 'http://localhost:3000';
        const isGet = req.method === 'GET';
        const data = isGet ? (req.query || {}) : (req.body || {});

        // Верификация подписи (если присутствует). Если подпись неверна — ведём на /fail
        const receivedSignature = data.signature;
        const dataWithoutSignature = { ...data };
        delete dataWithoutSignature.signature;

        if (receivedSignature) {
            const expectedSignature = createSignature(dataWithoutSignature);
            if (expectedSignature !== receivedSignature) {
                console.warn('Fondy return: invalid signature', {
                    received: receivedSignature,
                    expected: expectedSignature,
                });
                return res.redirect(302, appUrl + '/fail');
            }
        }

        const orderStatus = (data.order_status || '').toString().toLowerCase();
        const orderId = data.order_id;

        // Если платёж Approved — фиксируем покупку как в вебхуке
        if (orderStatus === 'approved' && orderId) {
            (async () => {
                try {
                    await db.query('UPDATE payment_orders SET Status = ? WHERE Order_ID = ?', ['approved', orderId]);

                    const [orderRows] = await db.query('SELECT User_ID FROM payment_orders WHERE Order_ID = ?', [orderId]);
                    const [itemRows] = await db.query('SELECT Painting_ID FROM payment_order_items WHERE Order_ID = ?', [orderId]);

                    if (orderRows.length > 0 && itemRows.length > 0) {
                        const userId = orderRows[0].User_ID;
                        const paintingIds = itemRows.map(r => r.Painting_ID);
                        const values = paintingIds.map(pid => [userId, pid]);
                        await db.query('INSERT IGNORE INTO user_purchases (User_ID, Painting_ID) VALUES ?', [values]);
                        console.log(`[Fondy return] Purchases recorded for User ${userId}, Items: ${paintingIds}`);
                    }
                } catch (e) {
                    console.error('Fondy return: error updating purchases', e);
                }
            })();
        }

        const target = orderStatus === 'approved' ? '/success' : '/fail';
        return res.redirect(302, appUrl + target);
    } catch (err) {
        console.error('Error in Fondy return:', err);
        return res.redirect(302, (APP_URL || 'http://localhost:3000') + '/fail');
    }
});

module.exports = router;