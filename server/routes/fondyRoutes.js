const express = require('express');
const crypto = require('crypto');
// Use global fetch if available (Node 18+), otherwise lazy-load node-fetch (ESM default)
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

// ✅ Подпись для Fondy (алгоритм из документации: SECRET + значения(отсортированные по ключам))
function createSignature(data) {
    // Исключаем undefined, null и ПУСТЫЕ СТРОКИ (""), как того требует Fondy
    const keys = Object.keys(data).filter((k) => {
        const v = data[k];
        // Исключаем служебное поле response_signature_string, если Fondy присылает его в ответе
        if (k === 'response_signature_string') return false;
        return v !== undefined && v !== null && v !== '';
    });
    keys.sort();
    const values = keys.map((k) => String(data[k]));
    // ВАЖНО: у Fondy секрет добавляется только в начале строки (без завершающего SECRET)
    const signatureString = [FONDY_SECRET, ...values].join('|');

    // Можно оставить на время дебага, потом закомментировать
    console.log('Fondy request signatureString:', signatureString);

    return crypto.createHash('sha1').update(signatureString).digest('hex');
}

// Вспомогательная функция: одна попытка создать сессию Fondy
async function createFondySessionOnce(intAmount) {
    // СУПЕР-УНИКАЛЬНЫЙ order_id (128 бит рандома)
    const uniqueOrderId = 'order_' + crypto.randomBytes(16).toString('hex');

    const appUrl = APP_URL || 'http://localhost:3000';
    const apiUrl = API_URL || 'http://localhost:8080';

    const payload = {
        merchant_id: FONDY_MERCHANT_ID,
        order_id: uniqueOrderId,
        order_desc: 'Покупка картины',
        currency: 'UAH',
        amount: intAmount,
        // ВАЖНО: направляем response_url на бэкенд, чтобы корректно принять POST/GET от Fondy и затем редиректнуть на фронт
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

    console.log('Fondy /create-session response (one attempt):', fondyResponse);

    return fondyResponse;
}

// ✅ Создание платёжной сессии (с автоповтором при 1013)
router.post('/create-session', async(req, res) => {
    try {
        const amount = req.body && req.body.amount;

        if (!amount) {
            return res.status(400).json({ error: 'amount_required' });
        }

        // amount в копейках (Fondy требует *100)
        const intAmount = Math.round(Number(amount) * 100);

        let attempts = 0;
        let fondyResponse = null;

        while (attempts < 3) {
            attempts += 1;
            fondyResponse = await createFondySessionOnce(intAmount);

            const resp = fondyResponse && fondyResponse.response ?
                fondyResponse.response :
                null;

            // Если нет ответа или это не 1013 — выходим из цикла
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

// Webhook от Fondy (заглушка)
router.post('/webhook', express.urlencoded({ extended: false }), (req, res) => {
    try {
        const data = req.body || {};

        const receivedSignature = data.signature;
        const dataWithoutSignature = { ...data };
        delete dataWithoutSignature.signature;

        const expectedSignature = createSignature(dataWithoutSignature);
        if (!receivedSignature || expectedSignature !== receivedSignature) {
            console.warn('Fondy webhook: invalid signature', {
                received: receivedSignature,
                expected: expectedSignature,
            });
            return res.status(400).send('invalid signature');
        }

        console.log('✅ Fondy webhook OK:', {
            order_id: data.order_id,
            order_status: data.order_status,
            amount: data.amount,
            currency: data.currency,
        });

        // TODO: обновить статус заказа в БД (approved/declined/processing и т.д.)

        return res.send('OK');
    } catch (err) {
        console.error('Error in Fondy webhook:', err);
        return res.sendStatus(500);
    }
});

// Возврат пользователя с Fondy (браузер редирект на наш backend), поддерживаем POST и GET
router.all('/return', express.urlencoded({ extended: false }), (req, res) => {
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
        const target = orderStatus === 'approved' ? '/success' : '/fail';

        return res.redirect(302, appUrl + target);
    } catch (err) {
        console.error('Error in Fondy return:', err);
        const appUrl = APP_URL || 'http://localhost:3000';
        return res.redirect(302, appUrl + '/fail');
    }
});

module.exports = router;