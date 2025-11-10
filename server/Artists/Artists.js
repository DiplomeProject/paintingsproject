const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

function bufferToDataUri(buffer, fallbackExt = 'jpeg') {
  if (!buffer) return null;
  const ext = fallbackExt.toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`;
}

function filePathToDataUri(filePath) {
  try {
    if (!filePath) return null;
    if (String(filePath).startsWith('data:')) return filePath; // already data URI
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    if (!fs.existsSync(resolved)) return null;
    const buffer = fs.readFileSync(resolved);
    const ext = path.extname(resolved).slice(1) || 'jpeg';
    return bufferToDataUri(buffer, ext);
  } catch (err) {
    console.error('filePathToDataUri error:', err);
    return null;
  }
}

// GET all artists + artworks
router.get('/getartists', async (req, res) => {
  try {
    const [artists] = await db.query('SELECT * FROM creators');

    const artistsWithArtworks = await Promise.all(
      artists.map(async (artist) => {
        // normalize artist id field
        const artistId = artist.Creator_ID || artist.Creator_Id || artist.CreatorId || artist.id;

        // Fetch paintings for this artist (try both possible column names)
        const [paintings] = await db.query(
          'SELECT * FROM paintings WHERE Creator_ID = ? OR Creator_Id = ?',
          [artistId, artistId]
        );

        // Normalize artist avatar: handle BLOB or file path or existing data URI
        let avatarData = null;
        if (artist.Image && Buffer.isBuffer(artist.Image)) {
          avatarData = bufferToDataUri(artist.Image);
        } else if (artist.imageBase64) {
          avatarData = artist.imageBase64;
        } else {
          avatarData = filePathToDataUri(artist.image || artist.image_path || artist.photo || artist.avatar);
        }
        if (avatarData) artist.imageBase64 = avatarData;

        // Convert each painting image to data URI if needed and set image_url
        artist.paintings = paintings.map((p) => {
          let imageUrl = null;
          // p.Image may be a Buffer from DB (BLOB) or a filesystem path string or already data URI
          if (p.Image && Buffer.isBuffer(p.Image)) {
            imageUrl = bufferToDataUri(p.Image);
          } else if (typeof p.Image === 'string') {
            imageUrl = filePathToDataUri(p.Image) || (p.Image.startsWith('data:') ? p.Image : null);
          }

          // also check any precomputed fields
          if (!imageUrl && (p.imageBase64 || p.image_url)) {
            imageUrl = p.imageBase64 || p.image_url;
          }

          // normalize returned fields
          return {
            ...p,
            image_url: imageUrl || null
          };
        });

        return artist;
      })
    );

    res.json(artistsWithArtworks);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Single artist
router.get('/artist/:id', async (req, res) => {
  const artistId = req.params.id;
  try {
    const [artistRows] = await db.query(
      'SELECT * FROM creators WHERE Creator_Id = ? OR Creator_ID = ?',
      [artistId, artistId]
    );
    if (artistRows.length === 0)
      return res.status(404).json({ error: 'Artist not found' });

    const artist = artistRows[0];

    // normalize avatar for single artist
    if (artist.Image && Buffer.isBuffer(artist.Image)) {
      artist.imageBase64 = bufferToDataUri(artist.Image);
    } else {
      artist.imageBase64 = filePathToDataUri(artist.image || artist.image_path || artist.photo || artist.avatar) || artist.imageBase64;
    }

    const [paintings] = await db.query(
      'SELECT * FROM paintings WHERE Creator_Id = ? OR Creator_ID = ?',
      [artistId, artistId]
    );

    artist.paintings = paintings.map((p) => {
      let imageUrl = null;
      if (p.Image && Buffer.isBuffer(p.Image)) {
        imageUrl = bufferToDataUri(p.Image);
      } else if (typeof p.Image === 'string') {
        imageUrl = filePathToDataUri(p.Image) || (p.Image.startsWith('data:') ? p.Image : null);
      }
      if (!imageUrl && (p.imageBase64 || p.image_url)) imageUrl = p.imageBase64 || p.image_url;
      return { ...p, image_url: imageUrl || null };
    });

    res.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
