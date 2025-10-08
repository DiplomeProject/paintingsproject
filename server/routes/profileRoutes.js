const express = require('express');
const db = require('../config/db');
const { uploadMemory } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Оновлення профілю
router.post('/update-profile', auth, uploadMemory.single('profileImage'), async (req, res) => {
    const userId = req.session.user.id;
    const { name, bio, email } = req.body;
    const newProfileImageBuffer = req.file ? req.file.buffer : null;

    try {
        await db.query(
            `UPDATE creators SET Name = ?, Other_Details = ?, Email = ?, Image = ? WHERE Creator_ID = ?`,
            [name, bio, email, newProfileImageBuffer || req.session.user._imageBlob || null, userId]
        );

        const profileImageBase64 = newProfileImageBuffer
            ? `data:image/jpeg;base64,${newProfileImageBuffer.toString('base64')}`
            : req.session.user.profileImage;

        req.session.user = {
            ...req.session.user,
            name,
            bio,
            email,
            profileImage: profileImageBase64,
            _imageBlob: newProfileImageBuffer || req.session.user._imageBlob || null
        };

        res.json({ success: true, message: 'Profile updated successfully', user: req.session.user });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

module.exports = router;
