const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/multerConfig');
const express = require('express');
const router = express.Router();

router.get('/getartists', async (req, res) => {
  try {
    const [artists] = await db.query('SELECT * FROM creators');
    res.json(artists);
  } catch (error) {
    router.get('/getartists', async (req, res) => {
        try {
            const [artists] = await db.query('SELECT * FROM creators');

            const artistsWithImages = await Promise.all(
                artists.map(async (artist) => {
                    // adjust these field names to match your DB column that stores the image path/filename
                    const imagePathField = artist.image || artist.image_path || artist.photo || artist.avatar;
                    if (!imagePathField) return artist;

                    // resolve path: if stored path is relative, resolve from project root; adjust as needed
                    const resolvedPath = path.isAbsolute(imagePathField)
                        ? imagePathField
                        : path.join(__dirname, '..', imagePathField);

                    try {
                        if (fs.existsSync(resolvedPath)) {
                            const buffer = fs.readFileSync(resolvedPath);
                            const ext = path.extname(resolvedPath).slice(1).toLowerCase();
                            const mimeType = ext === 'jpg' ? 'image/jpeg' : ext ? `image/${ext}` : 'application/octet-stream';
                            artist.imageBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
                        }
                    } catch (fsErr) {
                        // ignore individual file read errors, keep artist record without imageBase64
                        console.error('Error reading artist image:', fsErr);
                    }

                    return artist;
                })
            );

            res.json(artistsWithImages);
        } catch (error) {
            console.error('Error fetching artists:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/artist/:id', async (req, res) => {
  const artistId = req.params.id;
  try {
    const [artist] = await db.query('SELECT * FROM creators WHERE Creator_Id = ?', [artistId]);
    if (artist) {
      res.json(artist);
    } else {
      res.status(404).json({ error: 'Artist not found' });
    }
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;