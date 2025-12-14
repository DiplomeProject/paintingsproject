const express = require('express');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/authMiddleware');

const uploadMemory = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Ensure auxiliary table for per-user likes exists (idempotent)
let LIKES_TABLE_READY = false;
async function ensureLikesTable() {
  if (LIKES_TABLE_READY) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS painting_likes (
        Painting_ID BIGINT NOT NULL,
        User_ID BIGINT NOT NULL,
        Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_painting_user UNIQUE (Painting_ID, User_ID),
        INDEX idx_user (User_ID),
        INDEX idx_painting (Painting_ID)
      ) ENGINE=InnoDB;
    `);
    LIKES_TABLE_READY = true;
  } catch (e) {
    console.error('Failed to ensure painting_likes table:', e);
  }
}

/* =====================================================
   GET ALL PAINTINGS (main only)
===================================================== */
router.get('', async (req, res) => {
  try {
      const [rows] = await db.query(`
          SELECT p.Painting_ID,
                 p.Title,
                 p.Image,
                 p.Description,
                 p.Price,
                 p.Style,
                 p.Likes,
                 p.Creator_ID,
                 c.Name AS author_name
          FROM paintings p
          JOIN creators c ON p.Creator_ID = c.Creator_ID
      `);

    const paintings = rows.map(row => {
      const blob = row.Image;
      const image = blob ? `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}` : null;
        return {
            Painting_ID: row.Painting_ID,
            id: row.Painting_ID,
            Title: row.Title,
            title: row.Title,
            Description: row.Description,
            description: row.Description,
            Price: row.Price,
            price: row.Price,
            Style: row.Style,
            style: row.Style,
            Likes: row.Likes ?? null,
            likes: row.Likes ?? 0,
            author_name: row.author_name,
            Creator_ID: row.Creator_ID,
            image, // data URI or null
        };
    });

    res.json({ success: true, paintings });
  } catch (err) {
    console.error('Error fetching paintings:', err);
    res.status(500).json({ success: false, message: 'Error fetching paintings' });
  }
});

router.post("/upload", auth, uploadMemory.any(), async (req, res) => {
    // 1. ОТРИМУЄМО ВСІ ПОЛЯ, ЯКІ НАДСИЛАЄ ФРОНТЕНД
    const {
        title,
        description,
        category,
        style,
        format,
        price,
        width,
        height
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

        const images = req.files;

        /* 1️⃣ Create a new batch */
        const [batchResult] = await db.query(`INSERT INTO painting_batches () VALUES ()`);
        const Batch_ID = batchResult.insertId;

        /* 2️⃣ First image becomes main painting */
        const mainImage = images[0].buffer;

        // 2. ДОДАЄМО НОВІ ПОЛЯ В SQL ЗАПИТ
        // Зверніть увагу: ми додали Category, Style, Format, Size, Width, Height, Price
        const [paintingResult] = await db.query(
            `INSERT INTO paintings
             (Title, Description, Category, Style, Format, Width, Height, Price, Author, Creation_Date, Image, Creator_ID, Batch_ID)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
            [
                title,
                description,
                category || null,
                style || null,
                format || null,
                width || null,
                height || null,
                price || 0,
                Author,
                mainImage,
                Creator_ID,
                Batch_ID
            ]
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
router.get('/:id', async (req, res) => {
  const paintingId = req.params.id;

  try {
    // 1️⃣ Get the main painting with author info
    const [paintingRows] = await db.query(
      `SELECT p.*, c.Name AS author_name, c.Image AS author_image
       FROM paintings p
       JOIN creators c ON p.Creator_ID = c.Creator_ID
       WHERE p.Painting_ID = ?`,
      [paintingId]
    );

    if (paintingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Painting not found' });
    }

    const painting = paintingRows[0];

    // Convert main image to base64 URL
    const mainImage = painting.Image
      ? `data:image/jpeg;base64,${Buffer.from(painting.Image).toString('base64')}`
      : null;

    // 2️⃣ Get all additional images from the batch
    const [extraImagesRows] = await db.query(
      `SELECT Image FROM painting_images WHERE Batch_ID = ?`,
      [painting.Batch_ID]
    );

    const gallery = extraImagesRows.map(img => 
      img.Image ? `data:image/jpeg;base64,${Buffer.from(img.Image).toString('base64')}` : null
    );

      // Normalize author avatar (if available)
      let authorAvatar = null;
      try {
          if (painting.author_image) {
              if (Buffer.isBuffer(painting.author_image)) {
                  authorAvatar = `data:image/jpeg;base64,${Buffer.from(painting.author_image).toString('base64')}`;
              } else if (typeof painting.author_image === 'string') {
                  authorAvatar = painting.author_image.startsWith('data:')
                      ? painting.author_image
                      : painting.author_image; // could be a path/URL handled by frontend if needed
              }
          }
      } catch (e) {
          authorAvatar = null;
      }

      // Map additional descriptive fields if present in DB
      const category = painting.Category || painting.category || null;
      const format = painting.Format || painting.format || null;
      const width = painting.Width || painting.width || null;
      const height = painting.Height || painting.height || null;
      const size = painting.Size || painting.size || (width && height ? `${width}x${height}` : null);
      const creationDate = painting.Creation_Date || painting.creation_date || painting.created_at || null;

      // liked by current user?
      let likedByCurrentUser = false;
      try {
          const userId = req.session?.user?.Creator_ID || req.session?.user?.id || null;
          if (userId) {
              await ensureLikesTable();
              const [likeRows] = await db.query(
                  'SELECT 1 FROM painting_likes WHERE Painting_ID = ? AND User_ID = ? LIMIT 1',
                  [paintingId, userId]
              );
              likedByCurrentUser = likeRows.length > 0;
          }
      } catch (e) {
          // non-fatal
          likedByCurrentUser = false;
      }

      res.json({
          success: true,
          painting: {
              id: painting.Painting_ID,
              title: painting.Title,
              description: painting.Description,
              author_name: painting.author_name,
              author_avatar: authorAvatar,
              artistId: painting.Creator_ID,
              creator_id: painting.Creator_ID, // backward compatibility
              price: painting.Price,
              style: painting.Style,
              likes: painting.Likes || painting.likes || 0,
              likedByCurrentUser,
              category,
              format,
              size,
              width,
              height,
              creationDate,
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
   LIKE / UNLIKE A PAINTING (toggle per user)
===================================================== */
router.post('/:id/like', auth, async (req, res) => {
  const paintingId = parseInt(req.params.id, 10);
  const userId = req.session?.user?.Creator_ID || req.session?.user?.id;

  if (!Number.isFinite(paintingId)) {
    return res.status(400).json({ success: false, message: 'Invalid painting id' });
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // Ensure dependencies
    await ensureLikesTable();

    // Check painting exists
    const [existsRows] = await db.query('SELECT Painting_ID FROM paintings WHERE Painting_ID = ?', [paintingId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Painting not found' });
    }

    // Is currently liked by this user?
    const [likeRows] = await db.query(
      'SELECT 1 FROM painting_likes WHERE Painting_ID = ? AND User_ID = ? LIMIT 1',
      [paintingId, userId]
    );

    let liked;
    if (likeRows.length > 0) {
      // Unlike: remove link and decrement counter (not below 0)
      await db.query('DELETE FROM painting_likes WHERE Painting_ID = ? AND User_ID = ?', [paintingId, userId]);
      await db.query('UPDATE paintings SET Likes = CASE WHEN Likes > 0 THEN Likes - 1 ELSE 0 END WHERE Painting_ID = ?', [paintingId]);
      liked = false;
    } else {
      // Like: add link and increment counter
      try {
        await db.query('INSERT INTO painting_likes (Painting_ID, User_ID) VALUES (?, ?)', [paintingId, userId]);
        await db.query('UPDATE paintings SET Likes = COALESCE(Likes, 0) + 1 WHERE Painting_ID = ?', [paintingId]);
        liked = true;
      } catch (e) {
        // In case of race/duplicate, ensure consistency
        if (e && e.code === 'ER_DUP_ENTRY') {
          liked = true;
        } else {
          throw e;
        }
      }
    }

    // Return fresh counter
    const [[{ Likes } = { Likes: 0 }]] = await db.query('SELECT COALESCE(Likes, 0) AS Likes FROM paintings WHERE Painting_ID = ?', [paintingId]);
    return res.json({ success: true, liked, likes: Likes });
  } catch (err) {
    console.error('Error toggling like:', err);
    return res.status(500).json({ success: false, message: 'Error toggling like' });
  }
});

/* =====================================================
   DELETE PAINTING (also deletes batch and all images)
===================================================== */
router.delete('/delete/:id', auth, async (req, res) => {
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
