const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/multerConfig');
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
router.post('/api/commissions/public', upload.single('referenceImage'), async (req, res) => {
    const { title, description, category, style, size, format, price } = req.body;
    const user = req.session.user || { id: 1, email: 'test@example.com' }; // fallback for testing

    // Convert file to base64 if uploaded
    let referenceImageBase64 = null;
    if (req.file) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mimeType = req.file.mimetype || 'image/png';
        referenceImageBase64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    // ✅ FIXED SQL — includes Customer_ID
    const sql = `
        INSERT INTO commissions 
        (Title, Description, Category, Style, Size, Format, Price, ReferenceImage, Type, Customer_ID, Creator_ID, Status, Created_At)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, ?, 'open', NOW())
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
        user.id,   // 👈 Customer_ID
        null       // 👈 Creator_ID (not assigned yet)
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
});



// Updated GET route for Commissions.js backend

router.get('/api/commissions/public', async (req, res) => {
    const sql = `
        SELECT
            c.*,
            cr.Name AS customer_name,
            cr.Email AS customer_email
        FROM commissions c
                 LEFT JOIN creators cr ON c.Customer_ID = cr.Creator_ID
        WHERE c.Type = 'public' AND c.Status = 'open'
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
        res.json({ success: true, commissions: commissionsWithImages });
    } catch (err) {
        console.error('Error fetching public commissions:', err);
        res.status(500).json({ success: false, message: 'Error fetching commissions' });
    }
});





module.exports = router;