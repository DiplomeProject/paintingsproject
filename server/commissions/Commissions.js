const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/multerConfig');
const express = require('express');
const router = express.Router();



// 1. СТВОРЕННЯ ПУБЛІЧНОГО КОМІШЕНУ
router.post('/api/commissions/public', upload.single('referenceImage'), async (req, res) => {
    /*if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }*/

    const { title, description, category, style, size, format, price } = req.body;
    const user = req.session.user || { id: 1, email: 'test@example.com' }; // for testing

    const referenceImage = req.file
        ? path.join(user.email.split('@')[0], req.file.filename)
        : null;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    const sql = `
        INSERT INTO commissions 
        (Title, Description, Category, Style, Size, Format, Price, ReferenceImage, Type, Customer_ID, Status, Created_At)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, 'open', NOW())
    `;

    const values = [
        title,
        description,
        category || null,
        style || null,
        size || null,
        format || null,
        price || null,
        referenceImage,
        user.id 
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


// 2. СТВОРЕННЯ ПРЯМОГО КОМІШЕНУ (для конкретного художника)
router.post('/api/commissions/direct/:creatorId', upload.single('referenceImage'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const creatorId = req.params.creatorId;
    const {
        title,
        description,
        category,
        style,
        size,
        format,
        price
    } = req.body;

    const referenceImage = req.file ? path.join(req.session.user.email.split('@')[0], req.file.filename) : null;

    // Валідація
    if (!title || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'Title and description are required' 
        });
    }

    // Перевірка, чи існує художник
    const checkCreatorSql = 'SELECT Creator_ID, styles FROM creators WHERE Creator_ID = ?';
    db.query(checkCreatorSql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error checking creator:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Creator not found' 
            });
        }

        // Перевірка стилю (якщо вказано)
        if (style && results[0].styles) {
            const creatorStyles = JSON.parse(results[0].styles || '[]');
            if (!creatorStyles.includes(style)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Selected style is not available for this creator' 
                });
            }
        }

        // Створення комішену
        const sql = `
            INSERT INTO commissions 
            (Title, Description, Category, Style, Size, Format, Price, ReferenceImage, Type, Customer_ID, Creator_ID, Status, Created_At)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'direct', ?, ?, 'open', NOW())
        `;

        const values = [
            title,
            description,
            category || null,
            style || null,
            size || null,
            format || null,
            price || null,
            referenceImage,
            req.session.user.id,
            creatorId
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error creating direct commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error while creating commission' 
                });
            }

            res.status(201).json({ 
                success: true, 
                message: 'Direct commission created successfully',
                commissionId: result.insertId
            });
        });
    });
});

router.get('/api/commissions/public', async (req, res) => {
    // Corrected SQL for /api/commissions/public
    const sql = `
    SELECT 
        c.*,
        cr.Name as customer_name,
        cr.Email as customer_email
    FROM commissions c
    LEFT JOIN creators cr ON c.Customer_ID = cr.Creator_ID
    WHERE c.Type = 'public' AND c.Status = 'open'
    ORDER BY c.Created_At DESC
    `;


    try {
        const [results] = await db.query(sql); // Use the pool with async/await
        res.json({ 
            success: true, 
            commissions: results 
        });
    } catch (err) {
        console.error('Error fetching public commissions:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching commissions' 
        });
    }
});

// 4. ОТРИМАННЯ КОМІШЕНІВ КОНКРЕТНОГО ХУДОЖНИКА (прямі замовлення)
router.get('/api/commissions/creator/:creatorId', (req, res) => {
    const creatorId = req.params.creatorId;

    const sql = `
        SELECT 
            c.*,
            cr.Name as customer_name,
            cr.Email as customer_email
        FROM commissions c
        JOIN creators cr ON c.Customer_ID = cr.Creator_ID
        WHERE c.Creator_ID = ? AND c.Type = 'direct'
        ORDER BY c.Created_At DESC
    `;

    db.query(sql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error fetching creator commissions:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching commissions' 
            });
        }

        res.json({ 
            success: true, 
            commissions: results 
        });
    });
});

// 5. ОТРИМАННЯ КОМІШЕНІВ КОРИСТУВАЧА (замовника)
router.get('/api/commissions/my-orders', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const sql = `
        SELECT 
            c.*,
            cr.Name as creator_name,
            cr.Email as creator_email
        FROM commissions c
        LEFT JOIN creators cr ON c.Creator_ID = cr.Creator_ID
        WHERE c.Customer_ID = ?
        ORDER BY c.Created_At DESC
    `;

    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) {
            console.error('Error fetching user commissions:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching commissions' 
            });
        }

        res.json({ 
            success: true, 
            commissions: results 
        });
    });
});

// 6. ВЗЯТИ ПУБЛІЧНИЙ КОМІШЕН В РОБОТУ (для художника)
router.post('/api/commissions/:id/accept', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const creatorId = req.session.user.id;

    // Перевірка, чи комішен публічний і відкритий
    const checkSql = `
        SELECT * FROM commissions 
        WHERE Commission_ID = ? AND Type = 'public' AND Status = 'open' AND Creator_ID IS NULL
    `;

    db.query(checkSql, [commissionId], (err, results) => {
        if (err) {
            console.error('Error checking commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Commission not found or already taken' 
            });
        }

        // Присвоєння художника і зміна статусу
        const updateSql = `
            UPDATE commissions 
            SET Creator_ID = ?, Status = 'in_progress', Updated_At = NOW()
            WHERE Commission_ID = ?
        `;

        db.query(updateSql, [creatorId, commissionId], (err) => {
            if (err) {
                console.error('Error accepting commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error accepting commission' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Commission accepted successfully' 
            });
        });
    });
});

// 7. ОНОВЛЕННЯ СТАТУСУ КОМІШЕНУ
router.put('/api/commissions/:id/status', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const { status } = req.body;
    const userId = req.session.user.id;

    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid status' 
        });
    }

    // Перевірка прав доступу (замовник або виконавець)
    const checkSql = `
        SELECT * FROM commissions 
        WHERE Commission_ID = ? AND (Customer_ID = ? OR Creator_ID = ?)
    `;

    db.query(checkSql, [commissionId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error checking commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const updateSql = `
            UPDATE commissions 
            SET Status = ?, Updated_At = NOW()
            WHERE Commission_ID = ?
        `;

        db.query(updateSql, [status, commissionId], (err) => {
            if (err) {
                console.error('Error updating commission status:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error updating status' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Commission status updated successfully' 
            });
        });
    });
});

// 8. ОТРИМАННЯ СТИЛІВ ХУДОЖНИКА
router.get('/api/creator/:id/styles', (req, res) => {
    const creatorId = req.params.id;

    const sql = 'SELECT styles FROM creators WHERE Creator_ID = ?';

    db.query(sql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error fetching creator styles:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching styles' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Creator not found' 
            });
        }

        const styles = JSON.parse(results[0].styles || '[]');
        res.json({ 
            success: true, 
            styles: styles 
        });
    });
});

// 9. ОНОВЛЕННЯ СТИЛІВ ХУДОЖНИКА В ПРОФІЛІ
router.put('/api/creator/update-styles', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { styles } = req.body;
    const userId = req.session.user.id;

    if (!Array.isArray(styles)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Styles must be an array' 
        });
    }

    const sql = 'UPDATE creators SET styles = ? WHERE Creator_ID = ?';

    db.query(sql, [JSON.stringify(styles), userId], (err) => {
        if (err) {
            console.error('Error updating styles:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating styles' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Styles updated successfully' 
        });
    });
});

// 10. ВИДАЛЕННЯ КОМІШЕНУ
router.delete('/api/commissions/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const userId = req.session.user.id;

    // Спочатку отримуємо інформацію про комішен
    const selectSql = `
        SELECT ReferenceImage, Customer_ID 
        FROM commissions 
        WHERE Commission_ID = ?
    `;

    db.query(selectSql, [commissionId], (err, results) => {
        if (err) {
            console.error('Error fetching commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Commission not found' 
            });
        }

        // Перевірка, чи користувач є власником
        if (results[0].Customer_ID !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const imagePath = results[0].ReferenceImage;

        // Видалення з бази даних
        const deleteSql = 'DELETE FROM commissions WHERE Commission_ID = ?';

        db.query(deleteSql, [commissionId], (err) => {
            if (err) {
                console.error('Error deleting commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error deleting commission' 
                });
            }

            // Видалення файлу зображення, якщо він існує
            if (imagePath) {
                const fullPath = path.join(__dirname, 'public', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error('Error deleting reference image:', err);
                        }
                    });
                }
            }

            res.json({ 
                success: true, 
                message: 'Commission deleted successfully' 
            });
        });
    });
});

module.exports = router;