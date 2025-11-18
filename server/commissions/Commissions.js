const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const {upload} = require('../config/multerConfig');
const express = require('express');
const router = express.Router();

// new helpers to normalize images to data URIs
function bufferToDataUri(buffer, fallbackExt = 'png') {
    if (!buffer) return null;
    const ext = (fallbackExt || 'png').toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`;
}

function filePathToDataUri(filePath) {
    try {
        if (!filePath) return null;
        if (String(filePath).startsWith('data:')) return filePath; // already a data URI

        // try a few candidate locations relative to server
        const candidates = [
            path.join(__dirname, '..', 'public', filePath),
            path.join(__dirname, '..', filePath),
            path.join(__dirname, 'public', filePath),
            path.resolve(filePath)
        ];

        for (const c of candidates) {
            if (fs.existsSync(c)) {
                const buffer = fs.readFileSync(c);
                const ext = path.extname(c).slice(1) || 'png';
                return bufferToDataUri(buffer, ext);
            }
        }

        return null;
    } catch (err) {
        console.error('filePathToDataUri error:', err);
        return null;
    }
}

// 1. СТВОРЕННЯ ПУБЛІЧНОГО КОМІШЕНУ (із збереженням зображення в base64)
// Create a public commission (with up to 5 images)
router.post(
    '/api/commissions/public',
    upload.fields([
        {name: 'referenceImage', maxCount: 1},
        {name: 'image2', maxCount: 1},
        {name: 'image3', maxCount: 1},
        {name: 'image4', maxCount: 1},
        {name: 'image5', maxCount: 1}
    ]),
    async (req, res) => {
        const {title, description, category, style, size, format, price} = req.body;
        const user = req.session.user || {id: 1, email: 'test@example.com'}; // fallback for testing

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        // helper to safely convert file -> base64 data URI
        const fileToBase64 = (file) => {
            if (!file) return null;
            try {
                const fileBuffer = fs.readFileSync(file.path);
                const mimeType = file.mimetype || 'image/png';
                return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            } catch (err) {
                console.error(`Error reading ${file.originalname}:`, err);
                return null;
            }
        };

        // convert each possible image
        const referenceImageBase64 = fileToBase64(req.files?.referenceImage?.[0]);
        const image2xBase64 = fileToBase64(req.files?.image2?.[0]);
        const image3xBase64 = fileToBase64(req.files?.image3?.[0]);
        const image4xBase64 = fileToBase64(req.files?.image4?.[0]);
        const image5xBase64 = fileToBase64(req.files?.image5?.[0]);

        const sql = `
            INSERT INTO commissions
            (Title, Description, Category, Style, Size, Format, Price,
             ReferenceImage, Image2, Image3, Image4, Image5,
             Type, Customer_ID, Creator_ID, Status, Created_At)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, ?, 'open', NOW())
        `;

        const values = [
            title,
            description,
            category || null,
            style || null,
            size || null,
            format || null,
            price || null,
            referenceImageBase64,
            image2xBase64,
            image3xBase64,
            image4xBase64,
            image5xBase64,
            user.id, // Customer_ID
            null // Creator_ID
        ];

        try {
            const [result] = await db.query(sql, values);
            res.status(201).json({
                success: true,
                message: 'Public commission created successfully',
                commissionId: result.insertId
            });
        } catch (err) {
            console.error('Error creating public commission:', err);
            res.status(500).json({
                success: false,
                message: 'Database error while creating commission'
            });
        }
    }
);


// Updated GET route for Commissions.js backend

router.get('/api/commissions/public', async (req, res) => {
    const sql = `
        SELECT c.*,
               cr.Name  AS customer_name,
               cr.Email AS customer_email
        FROM commissions c
                 LEFT JOIN creators cr ON c.Customer_ID = cr.Creator_ID
        WHERE c.Type = 'public'
          AND c.Status = 'open'
        ORDER BY c.Created_At DESC
    `;

    try {
        const [results] = await db.query(sql);
        console.log(`Found ${results.length} commissions`);

        const commissionsWithImages = results.map((commission) => {
            let imageUrl = null;
            const ref = commission.ReferenceImage;

            console.log(`Commission ${commission.Commission_ID} (${commission.Title}):`);
            console.log(`  - ReferenceImage type: ${ref ? (Buffer.isBuffer(ref) ? 'Buffer' : typeof ref) : 'null'}`);

            if (ref) {
                let refAsString = null;

                // --- ПОЧАТОК ВИПРАВЛЕННЯ ---
                // 1. Перетворюємо буфер на рядок, якщо це буфер.
                // Ми припускаємо, що в БД зберігається рядок (Data URI або шлях до файлу).
                if (Buffer.isBuffer(ref)) {
                    refAsString = ref.toString('utf8');
                } else if (typeof ref === 'string') {
                    refAsString = ref;
                }

                // 2. Тепер працюємо з рядком
                if (refAsString) {
                    const trimmed = refAsString.trim();

                    // 3. Перевіряємо, чи це ВЖЕ готовий Data URI
                    if (trimmed.startsWith('data:image')) {
                        imageUrl = trimmed;
                        console.log(`  - Successfully processed data URI from DB`);
                    }
                    // 4. Якщо ні, припускаємо, що це шлях до файлу
                    else {
                        imageUrl = filePathToDataUri(trimmed);
                        console.log(`  - Tried file path, result: ${imageUrl ? 'success' : 'failed'}`);
                    }
                }
                // --- КІНЕЦЬ ВИПРАВЛЕННЯ ---

            } else {
                console.log(`  - No image data`);
            }

            // Return normalized commission object
            return {
                id: commission.Commission_ID,
                Commission_ID: commission.Commission_ID,
                Title: commission.Title,
                Description: commission.Description,
                Category: commission.Category,
                Style: commission.Style,
                Size: commission.Size,
                Format: commission.Format,
                Price: commission.Price,
                Type: commission.Type,
                Status: commission.Status,
                Customer_ID: commission.Customer_ID,
                Creator_ID: commission.Creator_ID,
                Created_At: commission.Created_At,
                customer_name: commission.customer_name,
                customer_email: commission.customer_email,
                imageUrl: imageUrl // This is the key field for frontend
            };
        });

        console.log(`Sending ${commissionsWithImages.length} commissions to frontend`);
        res.json({success: true, commissions: commissionsWithImages});
    } catch (err) {
        console.error('Error fetching public commissions:', err);
        res.status(500).json({success: false, message: 'Error fetching commissions'});
    }
});

// Get full details (including all images) - normalized same as public GET
router.get('/api/commissions/:id', async (req, res) => {
    const {id} = req.params;

    const sql = `
        SELECT Commission_ID,
               Title,
               Description,
               Category,
               Style,
               Size,
               Format,
               Price,
               ReferenceImage,
               Image2,
               Image3,
               Image4,
               Image5,
               Customer_ID,
               Creator_ID,
               Created_At,
               Updated_At
        FROM commissions
        WHERE Commission_ID = ?
        LIMIT 1
    `;

    try {
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({success: false, message: 'Commission not found'});
        }

        const commission = rows[0];

        // normalize any stored image value to a data URI or public URL (same logic as list endpoint)
        const toDataUri = (value) => {
            if (!value) return null;
            try {
                let valueAsString = null;

                // 1. Спершу спробуємо перетворити на рядок, якщо це буфер
                if (Buffer.isBuffer(value)) {
                    valueAsString = value.toString('utf8');
                } else if (typeof value === 'string') {
                    valueAsString = value;
                }

                // 2. Тепер обробляємо рядок
                if (valueAsString) {
                    const trimmed = valueAsString.trim();

                    // 2a. Це ВЖЕ готовий Data URI?
                    if (trimmed.startsWith('data:image')) {
                        return trimmed;
                    }

                    // 2b. Це "чистий" Base64 рядок без префікса?
                    const cleaned = trimmed.replace(/[\r\n\s]+/g, '');
                    if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 50) {
                        return `data:image/png;base64,${cleaned}`;
                    }

                    // 2c. Це шлях до файлу?
                    const fileConverted = filePathToDataUri(trimmed);
                    if (fileConverted) return fileConverted;

                    // 2d. Це URL?
                    if (/^https?:\/\//i.test(trimmed)) return trimmed;
                }

                // 3. (Fallback) Якщо це був буфер, але не схожий на рядок,
                //    спробуємо обробити його як "сирі" дані зображення.
                if (Buffer.isBuffer(value)) {
                    return bufferToDataUri(value, 'png'); // Виклик вашого bufferToDataUri згори
                }

                return null;
            } catch (err) {
                console.error(`[toDataUri] error converting image value for commission ${id}:`, err);
                return null;
            }
        };

        const image1 = toDataUri(commission.ReferenceImage);
        const image2 = toDataUri(commission.Image2);
        const image3 = toDataUri(commission.Image3);
        const image4 = toDataUri(commission.Image4);
        const image5 = toDataUri(commission.Image5);

        const images = [image1, image2, image3, image4, image5].filter(Boolean);

        console.log(`[GET /api/commissions/${id}] images normalized: ${images.length}`);

        res.json({
            success: true,
            commission: {
                id: commission.Commission_ID,
                title: commission.Title,
                description: commission.Description,
                category: commission.Category,
                style: commission.Style,
                size: commission.Size,
                format: commission.Format,
                price: commission.Price,
                images,   // array of normalized image sources (data: URIs or URLs)
                image1,   // individual normalized fields (may be null)
                image2,
                image3,
                image4,
                image5
            }
        });
    } catch (err) {
        console.error('Error fetching commission details:', err);
        res.status(500).json({success: false, message: 'Error fetching commission details'});
    }
});


module.exports = router;