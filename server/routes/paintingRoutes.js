const express = require('express');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const uploadMemory = multer({ storage: multer.memoryStorage() });

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


router.post('/upload', auth, uploadMemory.single('image'), async (req, res) => {

  const { title, description } = req.body;
  const Author = req.session.user ? req.session.user.name : null;
  const Creator_ID = req.session.user ? req.session.user.id : null;
  const imageBuffer = req.file ? req.file.buffer : null;



  try {
    await db.query(
      `INSERT INTO paintings (Title, Description, Author, Creation_Date, Image, Creator_ID)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [title, description, Author, imageBuffer, Creator_ID]
    );
    console.log('Painting successfully added to database');
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