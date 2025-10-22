const express = require('express');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Отримати всі картини
router.get('/api/paintings', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT p.Painting_ID, p.Title, p.Image, p.Description, c.Name AS author_name
      FROM Paintings p
      JOIN creators c ON p.Creator_ID = c.Creator_ID
    `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching paintings:', err);
        res.status(500).send('Error fetching paintings');
    }
});

// Завантажити нову картину
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;
    if (!title || !description || !image) return res.status(400).json({ success: false, message: 'All fields required' });

    const email = req.session.user.email;
    const imagePath = path.join(email.split('@')[0], image);

    try {
        await db.query(
            `INSERT INTO Paintings (Title, Description, Creator_ID, Creation_Date, Image) VALUES (?, ?, ?, NOW(), ?)`,
            [title, description, req.session.user.id, imagePath]
        );
        res.status(201).json({ success: true, message: 'Painting added successfully' });
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Видалити картину
router.delete('/paintings/:id', auth, async (req, res) => {
    const paintingId = req.params.id;
    const userId = req.session.user.id;

    try {
        const [rows] = await db.query('SELECT Image FROM Paintings WHERE Painting_ID = ? AND Creator_ID = ?', [paintingId, userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Painting not found' });

        const imagePath = path.join(__dirname, '..', rows[0].Image);
        await db.query('DELETE FROM Paintings WHERE Painting_ID = ? AND Creator_ID = ?', [paintingId, userId]);

        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        res.json({ success: true, message: 'Painting deleted successfully' });
    } catch (err) {
        console.error('Error deleting painting:', err);
        res.status(500).json({ success: false, message: 'Error deleting painting' });
    }
});

module.exports = router;
