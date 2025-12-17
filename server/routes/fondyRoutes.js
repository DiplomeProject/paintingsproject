const express = require('express');
const crypto = require('crypto');
const db = require('../config/db'); // Импортируем подключение к БД
const auth = require('../middleware/authMiddleware'); // Добавляем middleware авторизации
const { getIO } = require('../socket');

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
        // Добавляем type и commissionId в получение данных
        const { amount, paintingIds, type, commissionId } = req.body;
        const userId = req.session.user?.Creator_ID || req.session.user?.id;

        // Проверяем наличие суммы
        if (!amount) {
            return res.status(400).json({ error: 'amount_required' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const intAmount = Math.round(Number(amount) * 100);

        // Определяем тип заказа (по умолчанию 'cart')
        const orderType = type || 'cart';
        // ID цели (если комишен, то ID комишена, иначе 0)
        const targetId = commissionId || 0;

        // Генерируем уникальный ID заказа
        const uniqueOrderId = 'order_' + crypto.randomBytes(16).toString('hex');

        // 1. Сохраняем заказ в БД с новыми полями Type и Target_ID
        await db.query(
            'INSERT INTO payment_orders (Order_ID, User_ID, Status, Type, Target_ID) VALUES (?, ?, ?, ?, ?)',
            [uniqueOrderId, userId, 'pending', orderType, targetId]
        );

        // 2. Если это корзина ('cart'), сохраняем товары как раньше
        if (orderType === 'cart' && paintingIds && paintingIds.length > 0) {
            const orderItemsValues = paintingIds.map(pid => [uniqueOrderId, pid]);
            await db.query('INSERT INTO payment_order_items (Order_ID, Painting_ID) VALUES ?', [orderItemsValues]);
        }

        // 3. Создаем сессию в Fondy
        let attempts = 0;
        let fondyResponse = null;

        while (attempts < 3) {
            attempts += 1;
            fondyResponse = await createFondySessionOnce(intAmount, uniqueOrderId);

            const resp = fondyResponse && fondyResponse.response ? fondyResponse.response : null;
            if (!resp) break;

            const code = resp.error_code;
            // Если ошибка 1013 (дубликат), пробуем снова (но по хорошему uniqueOrderId уже записан в БД, так что это редкий кейс)
            if (code === 1013 || code === '1013') {
                console.warn('Fondy duplicate order_id, retrying...');
                continue;
            }
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
            console.warn('Fondy webhook: invalid signature');
            return res.status(400).send('invalid signature');
        }

        const orderId = data.order_id;
        const orderStatus = data.order_status;

        console.log(`✅ Fondy webhook: Order ${orderId} status ${orderStatus}`);

        if (orderStatus === 'approved') {
            // 1. Сначала получаем информацию о типе заказа из нашей БД
            const [orders] = await db.query('SELECT * FROM payment_orders WHERE Order_ID = ?', [orderId]);

            if (orders.length > 0) {
                const order = orders[0];

                // Обновляем статус самого заказа в payment_orders
                await db.query('UPDATE payment_orders SET Status = ? WHERE Order_ID = ?', ['approved', orderId]);

                if (order.Type === 'commission') {
                    if (order.Target_ID) {
                        await db.query('UPDATE commissions SET is_paid = 1 WHERE Commission_ID = ?', [order.Target_ID]);
                        console.log(`[Fondy Return] Commission #${order.Target_ID} marked as PAID.`);

                        try {
                            const io = getIO();
                            // Отправляем событие paymentUpdate всем, кто смотрит этот комишен
                            io.to(`commission_${order.Target_ID}`).emit('paymentUpdate', {
                                commissionId: order.Target_ID,
                                is_paid: 1
                            });
                        } catch (e) {
                            console.warn('Socket emit error:', e.message);
                        }
                    }
                } else {
                    // --- ЭТО ОБЫЧНАЯ ПОКУПКА КАРТИН (КОРЗИНА) ---
                    const [itemRows] = await db.query('SELECT Painting_ID FROM payment_order_items WHERE Order_ID = ?', [orderId]);

                    if (itemRows.length > 0) {
                        const userId = order.User_ID;
                        const paintingIds = itemRows.map(r => r.Painting_ID);
                        const values = paintingIds.map(pid => [userId, pid]);

                        // Добавляем в покупки пользователя
                        await db.query('INSERT IGNORE INTO user_purchases (User_ID, Painting_ID) VALUES ?', [values]);
                        console.log(`Purchases recorded for User ${userId}, Items: ${paintingIds}`);
                    }
                }
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
                    // 1. Получаем сам заказ, чтобы узнать Тип и ID цели
                    const [orders] = await db.query('SELECT * FROM payment_orders WHERE Order_ID = ?', [orderId]);

                    if (orders.length > 0) {
                        const order = orders[0];

                        // Обновляем статус заказа оплаты
                        await db.query('UPDATE payment_orders SET Status = ? WHERE Order_ID = ?', ['approved', orderId]);

                        // 2. Логика в зависимости от ТИПА
                        if (order.Type === 'commission') {
                            // === ЛОГИКА ДЛЯ КОМИШЕНА ===
                            if (order.Target_ID) {
                                await db.query('UPDATE commissions SET is_paid = 1 WHERE Commission_ID = ?', [order.Target_ID]);
                                console.log(`[Fondy Return] Commission #${order.Target_ID} marked as PAID.`);

                                try {
                                    const io = getIO();
                                    // Отправляем событие paymentUpdate всем, кто смотрит этот комишен
                                    io.to(`commission_${order.Target_ID}`).emit('paymentUpdate', {
                                        commissionId: order.Target_ID,
                                        is_paid: 1
                                    });
                                } catch (e) {
                                    console.warn('Socket emit error:', e.message);
                                }
                            }
                        } else {
                            // === ЛОГИКА ДЛЯ КОРЗИНЫ (старая) ===
                            const [itemRows] = await db.query('SELECT Painting_ID FROM payment_order_items WHERE Order_ID = ?', [orderId]);
                            if (itemRows.length > 0) {
                                const userId = order.User_ID;
                                const paintingIds = itemRows.map(r => r.Painting_ID);
                                const values = paintingIds.map(pid => [userId, pid]);
                                await db.query('INSERT IGNORE INTO user_purchases (User_ID, Painting_ID) VALUES ?', [values]);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Fondy return: error updating db', e);
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