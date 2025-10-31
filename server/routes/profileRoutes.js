const express = require('express');
const db = require('../config/db');
const { uploadMemory } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Update user profile
router.post('/update-profile', auth, uploadMemory.single('profileImage'), async (req, res) => {
    // Use either Creator_ID or id, depending on how the session was stored
    const userId = req.session.user?.Creator_ID || req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { name, bio, email } = req.body;
    const newProfileImageBuffer = req.file ? req.file.buffer : null;

    try {
        // ✅ Perform the update
        await db.query(
            `UPDATE creators 
             SET Name = ?, Other_Details = ?, Email = ?, Image = ? 
             WHERE Creator_ID = ?`,
            [
                name,
                bio,
                email,
                newProfileImageBuffer || req.session.user._imageBlob || null,
                userId
            ]
        );

        // ✅ Convert the image buffer to base64 for frontend display
        const profileImageBase64 = newProfileImageBuffer
            ? `data:image/jpeg;base64,${newProfileImageBuffer.toString('base64')}`
            : req.session.user.profileImage;

        // ✅ Update session safely (avoid storing raw BLOBs)
        req.session.user = {
            ...req.session.user,
            name,
            bio,
            email,
            profileImage: profileImageBase64,
            // Store only a small reference, not the full binary
            _imageBlob: newProfileImageBuffer ? newProfileImageBuffer : req.session.user._imageBlob || null
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
      `SELECT Painting_ID AS id, Title AS title, Image AS image_url, Description AS description, Price AS price, Style AS style 
       FROM paintings 
       WHERE Creator_ID = ?`,
      [userId]
    );

    res.json({
      success: true,
      paintings: rows, // ✅ the actual array of paintings
    });
  } catch (err) {
    console.error('Error fetching user paintings:', err);
    res.status(500).json({ success: false, message: 'Error fetching user paintings' });
  }
});


   

module.exports = router;