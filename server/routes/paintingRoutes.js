const express = require('express');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/authMiddleware');

const uploadMemory = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/* =====================================================
   GET ALL PAINTINGS (main only)
===================================================== */
router.get('/api/paintings', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.Painting_ID,
        p.Title,
        p.Image,
        p.Description,
        p.Price,
        p.Style,
        p.Category,
        p.Format,
        p.Width,
        p.Height,
        c.Name AS author_name
      FROM paintings p
      JOIN creators c ON p.Creator_ID = c.Creator_ID
    `);

    const paintings = rows.map(row => {
      const blob = row.Image;
      const image = blob
        ? `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}`
        : null;

      return {
        id: row.Painting_ID,
        title: row.Title,
        description: row.Description,
        price: row.Price,
        style: row.Style,
        category: row.Category,
        fileFormat: row.Format,

        // <- ensure width and height are returned
        width: row.Width || null,
        height: row.Height || null,
        size: (row.Width && row.Height) ? `${row.Width} x ${row.Height}` : null,

        artistName: row.author_name,
        imageUrl: image,
        images: image ? [image] : []
      };
    });

    res.json({ success: true, paintings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching paintings' });
  }
});

/* =====================================================
   UPLOAD IMAGES (up to 10) — uses Batch_ID
===================================================== */
router.post("/upload", auth, uploadMemory.any(), async (req, res) => {
    const { 
        title, 
        description, 
        category,
        style, 
        format,
        price,
        size
    } = req.body;

    const Author = req.session.user?.name || null;
    const Creator_ID = req.session.user?.id || null;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        if (req.files.length > 10) {
            return res.status(400).json({ message: "Too many images uploaded (max 10)" });
        }

        // Extract width & height from "1080x1920"
        let width = null;
        let height = null;

        if (size && size.includes("x")) {
            const parts = size.toLowerCase().split("x");
            width = parseInt(parts[0]);
            height = parseInt(parts[1]);
        }

        const images = req.files;

        // 1️⃣ Create batch
        const [batchResult] = await db.query(`INSERT INTO painting_batches () VALUES ()`);
        const Batch_ID = batchResult.insertId;

        // 2️⃣ Main image
        const mainImage = images[0].buffer;

        // 3️⃣ Save main painting
        const [paintingResult] = await db.query(
            `INSERT INTO paintings
                (Title, Description, Author, Creation_Date, Image, Creator_ID, Batch_ID, 
                 Category, Style, Format, Price, Width, Height, Likes)
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                title,
                description,
                Author,
                mainImage,
                Creator_ID,
                Batch_ID,
                category || null,
                style || null,
                format || null,
                price || 0,
                width,
                height
            ]
        );

        // 4️⃣ Additional gallery images
        for (let i = 1; i < images.length; i++) {
            await db.query(
                `INSERT INTO painting_images (Batch_ID, Image) VALUES (?, ?)`,
                [Batch_ID, images[i].buffer]
            );
        }

        res.status(201).json({
            success: true,
            message: "Painting uploaded successfully",
            paintingID: paintingResult.insertId,
            Batch_ID
        });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});


/* =====================================================
   GET PAINTING + ALL IMAGES IN SAME BATCH
===================================================== */
router.get('/api/paintings/:id', async (req, res) => {
  const paintingId = req.params.id;

  try {
    // 1️⃣ Get the main painting with author info
    const [paintingRows] = await db.query(
      `SELECT p.*, c.Name AS author_name
       FROM paintings p
       JOIN creators c ON p.Creator_ID = c.Creator_ID
       WHERE p.Painting_ID = ?`,
      [paintingId]
    );

    if (paintingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Painting not found' });
    }

    const painting = paintingRows[0];

    // Convert main image to base64
    const mainImage = painting.Image
      ? `data:image/jpeg;base64,${Buffer.from(painting.Image).toString('base64')}`
      : null;

    // 2️⃣ Fetch gallery images
    const [extraImagesRows] = await db.query(
      `SELECT Image FROM painting_images WHERE Batch_ID = ?`,
      [painting.Batch_ID]
    );

    const gallery = extraImagesRows.map(img => 
      img.Image
        ? `data:image/jpeg;base64,${Buffer.from(img.Image).toString('base64')}`
        : null
    );

    // 3️⃣ Build size string
    const size =
      painting.Width && painting.Height
        ? `${painting.Width} x ${painting.Height}`
        : null;

    // 4️⃣ Send final payload
    res.json({
      success: true,
      painting: {
        id: painting.Painting_ID,
        title: painting.Title,
        description: painting.Description,
        author_name: painting.author_name,

        // 🔥 new fields
        category: painting.Category,
        style: painting.Style,
        format: painting.Format,
        price: painting.Price,
        width: painting.Width,
        height: painting.Height,
        size,
        likes: painting.Likes || 0,

        // images
        mainImage,
        gallery,

        batchId: painting.Batch_ID
      }
    });

  } catch (err) {
    console.error('Error fetching painting:', err);
    res.status(500).json({ success: false, message: 'Error fetching painting' });
  }
});


/* =====================================================
   DELETE PAINTING (also deletes batch and all images)
===================================================== */
router.delete('/paintings/:id', auth, async (req, res) => {
    const paintingId = req.params.id;
    const userId = req.session.user.id;

    try {
        // Get batch ID
        const [[painting]] = await db.query(
            'SELECT Batch_ID FROM paintings WHERE Painting_ID = ? AND Creator_ID = ?',
            [paintingId, userId]
        );

        if (!painting) {
            return res.status(404).json({ success: false, message: 'Painting not found' });
        }

        const batchID = painting.Batch_ID;

        // Delete main painting
        await db.query('DELETE FROM paintings WHERE Painting_ID = ?', [paintingId]);

        // Delete all images in the batch
        await db.query('DELETE FROM painting_images WHERE Batch_ID = ?', [batchID]);
        await db.query('DELETE FROM painting_batches WHERE Batch_ID = ?', [batchID]);

        res.json({ success: true, message: 'Painting deleted successfully' });

    } catch (err) {
        console.error('Error deleting painting:', err);
        res.status(500).json({ success: false, message: 'Error deleting painting' });
    }
});



module.exports = router;
