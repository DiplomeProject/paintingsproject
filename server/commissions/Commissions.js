const db = require('../config/db');
const path = require('path');
const express = require('express');
const router = express.Router();
const { upload, uploadMemory } = require('../config/multerConfig');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, R2_BUCKET_NAME, R2_PUBLIC_URL } = require('../config/s3Client');
const crypto = require('crypto');

// --- 1. СТВОРЕННЯ КОМІШЕНУ (ОНОВЛЕНО для 5 зображень) ---
// Використовуємо upload.array('images', 5) замість upload.single()
router.post('/api/commissions/public', uploadMemory.array('images', 5), async (req, res) => {

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const { title, description, category, style, size, format, price } = req.body;

        if (!req.session.user) {
            await conn.rollback();
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const user = req.session.user;

        if (!title || !description) {
            // (ВИПРАВЛЕНО) Додано 'await conn.rollback()' перед виходом
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const sqlCommission = `
            INSERT INTO commissions
            (Title, Description, Category, Style, Size, Format, Price, Type, Customer_ID, Status, Created_At)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'public', ?, 'open', NOW())
        `;

        const valuesCommission = [
            title, description, category || null, style || null, size || null,
            format || null, price || null, user.id
        ];
        const [result] = await conn.query(sqlCommission, valuesCommission);
        const newCommissionId = result.insertId;

        if (req.files && req.files.length > 0) {

            const uploadPromises = req.files.map(file => {
                const randomName = crypto.randomBytes(16).toString('hex');
                const fileName = `${user.id || 'public'}/${newCommissionId}/${randomName}${path.extname(file.originalname)}`;

                const params = {
                    Bucket: R2_BUCKET_NAME,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };

                return s3.send(new PutObjectCommand(params))
                    .then(() => {
                        return `${R2_PUBLIC_URL}/${fileName}`;
                    });
            });

            const fileUrls = await Promise.all(uploadPromises);

            const sqlImage = `
                INSERT INTO commission_images (Commission_ID, ImageData, Is_Main)
                VALUES (?, ?, ?)
            `;

            for (let i = 0; i < fileUrls.length; i++) {
                const isMain = (i === 0) ? 1 : 0;
                const imageDataJson = JSON.stringify([fileUrls[i]]);
                await conn.query(sqlImage, [newCommissionId, imageDataJson, isMain]);
            }
        }

        await conn.commit();
        conn.release();
        res.status(201).json({
            success: true,
            message: 'Public commission created successfully',
            commissionId: newCommissionId
        });

    } catch (err) {
        if (conn) {
            await conn.rollback();
            conn.release();
        }
        console.error('Error creating public commission:', err);
        res.status(500).json({
            success: false,
            message: 'Database error while creating commission'
        });
    }
});


// --- 2. ОТРИМАННЯ КОМІШЕНІВ (ОНОВЛЕНО для 5 зображень) ---
router.get('/api/commissions/public', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 52;
        const offset = (page - 1) * limit;

        const countSql = `SELECT COUNT(*) as total FROM commissions WHERE Type = 'public' AND Status = 'open'`;
        const [countResult] = await db.query(countSql);
        const totalCommissions = countResult[0].total;
        const totalPages = Math.ceil(totalCommissions / limit);

        const sqlCommissions = `
            SELECT 
                c.*,
                cr.Name AS customer_name,
                cr.Email AS customer_email
            FROM commissions c
            LEFT JOIN creators cr ON c.Customer_ID = cr.Creator_ID
            WHERE c.Type = 'public' AND c.Status = 'open'
            ORDER BY c.Created_At DESC
            LIMIT ? OFFSET ?;
        `;

        const [commissions] = await db.query(sqlCommissions, [limit, offset]);

        if (commissions.length === 0) {
            return res.json({ success: true, commissions: [], totalPages: 0 });
        }
        const commissionIds = commissions.map(c => c.Commission_ID);

        const sqlImages = `
            SELECT Commission_ID, ImageData
            FROM commission_images
            WHERE Commission_ID IN (?) AND Is_Main = 1;
        `;
        const [images] = await db.query(sqlImages, [commissionIds]);

        // --- Крок 4: "Зшиваємо" дані (тільки URL) ---
        const imageMap = {};
        for (const img of images) {
            const id = img.Commission_ID;
            let imageUrl = null;
            try {
                if (img.ImageData && Array.isArray(img.ImageData)) {
                    imageUrl = img.ImageData[0];
                }
            } catch (e) { console.error(`Failed to read image URL for commission ${id}:`, e); }

            if (imageUrl) {
                imageMap[id] = imageUrl;
            }
        }

        // --- Крок 5: Формуємо відповідь ---
        const commissionsWithImages = commissions.map(commission => {
            const imageUrl = imageMap[commission.Commission_ID] || null;

            return {
                ...commission,
                id: commission.Commission_ID,
                imageUrl: imageUrl,
                allImages: []
            };
        });

        res.json({
            success: true,
            commissions: commissionsWithImages,
            totalPages: totalPages
        });

    } catch (err) {
        console.error('Error fetching public commissions:', err);
        res.status(500).json({ success: false, message: 'Error fetching commissions' });
    }
});

router.get('/api/commissions/:id/images', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: 'Commission ID is required' });
    }

    // Завантажуємо всі зображення для одного ID, головне (Is_Main=1) - першим
    const sql = `
        SELECT ImageData
        FROM commission_images
        WHERE Commission_ID = ?
        ORDER BY Is_Main DESC, Image_ID ASC;
    `;

    try {
        const [images] = await db.query(sql, [id]);

        // (ОНОВЛЕНО) Витягуємо URL рядки з JSON-масивів
        const allImages = images.map(img => {
            try {
                if (img.ImageData && Array.isArray(img.ImageData)) {
                    return img.ImageData[0]; // Це вже URL
                }
            } catch (e) { /* ігноруємо */ }
            return null;
        }).filter(Boolean); // Фільтруємо ті, що 'null'

        res.json({ success: true, images: allImages });

    } catch (err) {
        console.error('Error fetching commission images:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching images' });
    }
});

module.exports = router;