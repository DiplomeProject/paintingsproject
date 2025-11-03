const express = require('express');
const db = require('../config/db');
const { uploadMemory } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-profile', auth, uploadMemory.single('profileImage'), async (req, res) => {
  const userId = req.session.user?.Creator_ID || req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  const { name, bio, email } = req.body;

  try {
    // Get current user data to access existing image if no new one uploaded
    const [currentUser] = await db.query('SELECT Image FROM creators WHERE Creator_ID = ?', [userId]);
    
    // Use new image if uploaded, otherwise keep existing image
    const imageBuffer = req.file ? req.file.buffer : currentUser[0].Image;

    // Build SQL query
    await db.query(
      `UPDATE creators 
       SET Name = ?, Other_Details = ?, Email = ?, Image = ? 
       WHERE Creator_ID = ?`,
      [name, bio, email, imageBuffer, userId]
    );

    // Convert image buffer to base64 for frontend
    const profileImageBase64 = Buffer.isBuffer(imageBuffer)
      ? `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
      : null;

    // Update session
    req.session.user = {
      ...req.session.user,
      name,
      bio,
      email,
      profileImage: profileImageBase64,
      _imageBlob: imageBuffer
    };

    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: req.session.user 
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});



router.get('/getuserpaintings', auth, async (req, res) => {
  const userId = req.session.user?.Creator_ID || req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  try {
    const [rows] = await db.query(
      `SELECT Painting_ID AS id, Title AS title, Image AS image_blob, Description AS description, Price AS price, Style AS style 
       FROM paintings 
       WHERE Creator_ID = ?`,
      [userId]
    );

    const paintings = rows.map((row) => {
      const blob = row.image_blob;
      const image_url = blob
        ? `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}`
        : null;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        style: row.style,
        image_url,
      };
    });

    res.json({
      success: true,
      paintings,
    });
  } catch (err) {
    console.error('Error fetching user paintings:', err);
    res.status(500).json({ success: false, message: 'Error fetching user paintings' });
  }
});


module.exports = router;