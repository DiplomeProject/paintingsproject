const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, birthday } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO creators (Name, Email, Password, Birthday) VALUES (?, ?, ?, ?)`;
        await db.query(sql, [username, email, hash, birthday || null]);
        res.status(201).json({ success: true, message: 'User registered' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ success: false, message: 'Database error during registration' });
    }
});

// Check email
router.post('/check-email', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT Email FROM creators WHERE Email = ?', [req.body.email]);
        res.json({ exists: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: 'Database error while checking email' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM creators WHERE Email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.Password);
        if (!match) return res.status(401).json({ success: false, message: 'Incorrect password' });

        const imageData = user.Image;
        const profileImage = Buffer.isBuffer(imageData)
            ? `data:image/jpeg;base64,${imageData.toString('base64')}`
            : imageData || 'img/icons/profile.jpg';

        req.session.user = {
            id: user.Creator_ID,
            name: user.Name,
            email: user.Email,
            bio: user.Other_Details || '',
            profileImage,
            _imageBlob: Buffer.isBuffer(imageData) ? imageData : null
        };

        res.json({ success: true, message: 'Login successful', user: req.session.user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Check session
router.get('/check-session', (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: req.session.user });
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false });
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout successful' });
    });
});

module.exports = router;
