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


/*router.post('/upload', auth, uploadMemory.single('image'), async (req, res) => {

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
});*/


router.post("/upload", auth, uploadMemory.any(), async (req, res) => {
    const { title, description } = req.body;

    const Author = req.session.user?.name || null;
    const Creator_ID = req.session.user?.id || null;

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      // Accept files sent under fieldnames 'images' or 'image' (and common variants),
      // otherwise fall back to all uploaded files. Enforce a 5-file limit.
      const allowedFieldNames = ['images', 'image', 'images[]', 'file', 'files'];
      let images = req.files.filter(f => allowedFieldNames.includes(f.fieldname));

      if (images.length === 0) {
        images = req.files; // fallback to any uploaded files
      }

      if (images.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      if (images.length > 5) {
        return res.status(400).json({ message: "Too many images uploaded (max 5)" });
      }

      // Create order ID
      const [orderResult] = await db.query(
        `INSERT INTO OrderPaintings (Image) VALUES (NULL)`
      );
      const orderID = orderResult.insertId;

      // First image becomes main painting
      const mainImage = images[0].buffer;

      const [paintingResult] = await db.query(
        `INSERT INTO paintings (Title, Description, Author, Creation_Date, Image, Creator_ID, Order_ID)
         VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
        [title, description, Author, mainImage, Creator_ID, orderID]
      );

      // Insert extra images into OrderPaintings
      for (let i = 1; i < images.length; i++) {
        await db.query(
          `INSERT INTO OrderPaintings (Order_ID, Image) VALUES (?, ?)`,
          [orderID, images[i].buffer]
        );
      }

      res.status(201).json({
        success: true,
        message: "Painting uploaded successfully",
        paintingID: paintingResult.insertId,
        orderID,
      });

    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Database error" });
    }
  }
);


router.get('/api/paintings/:id', async (req, res) => {
    const paintingId = req.params.id;

    try {
        // 1️⃣ Get the main painting
        const [paintingRows] = await db.query(`
            SELECT p.*, c.Name AS author_name
            FROM paintings p
            JOIN creators c ON p.Creator_ID = c.Creator_ID
            WHERE p.Painting_ID = ?
        `, [paintingId]);

        if (paintingRows.length === 0) {
            return res.status(404).json({ message: 'Painting not found' });
        }

        const painting = paintingRows[0];

        // 2️⃣ Get all grouped images by Order ID
        const [extraImages] = await db.query(`
            SELECT Image FROM OrderPaintings WHERE Order_ID = ?
        `, [painting.Order_ID]);

        res.json({
            main: painting,
            gallery: extraImages   // includes all additional images
        });

    } catch (err) {
        console.error('Error fetching painting:', err);
        res.status(500).json({ message: 'Error fetching painting' });
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