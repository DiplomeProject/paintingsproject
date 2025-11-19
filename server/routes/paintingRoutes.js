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
            SELECT p.Painting_ID, p.Title, p.Image, p.Description, c.Name AS author_name
            FROM paintings p
            JOIN creators c ON p.Creator_ID = c.Creator_ID
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching paintings:', err);
        res.status(500).send('Error fetching paintings');
    }
});

/* =====================================================
   UPLOAD IMAGES (up to 10) — uses Batch_ID
===================================================== */
router.post("/upload", auth, uploadMemory.any(), async (req, res) => {
    const { title, description } = req.body;
    const Author = req.session.user?.name || null;
    const Creator_ID = req.session.user?.id || null;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        if (req.files.length > 10) {
            return res.status(400).json({ message: "Too many images uploaded (max 10)" });
        }

        const images = req.files;

        /* 1️⃣ Create a new batch */
        const [batchResult] = await db.query(`INSERT INTO painting_batches () VALUES ()`);
        const Batch_ID = batchResult.insertId;

        /* 2️⃣ First image becomes main painting */
        const mainImage = images[0].buffer;

        const [paintingResult] = await db.query(
            `INSERT INTO paintings 
                (Title, Description, Author, Creation_Date, Image, Creator_ID, Batch_ID)
             VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
            [title, description, Author, mainImage, Creator_ID, Batch_ID]
        );

        /* 3️⃣ Additional images go to painting_images */
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
            Batch_ID,
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

        // 2️⃣ Get all additional images from the batch
        const [extraImages] = await db.query(`
            SELECT Image 
            FROM painting_images 
            WHERE Batch_ID = ?
        `, [painting.Batch_ID]);

        res.json({
            main: painting,
            gallery: extraImages
        });

    } catch (err) {
        console.error('Error fetching painting:', err);
        res.status(500).json({ message: 'Error fetching painting' });
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
