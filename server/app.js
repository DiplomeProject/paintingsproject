const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const paintingRoutes = require('./routes/paintingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const commissionsRoutes = require('./commissions/Commissions');
const artistsRoutes = require('./Artists/Artists');

const app = express();

// --- REAL CORS CONFIG ---
app.use(cors({
    origin: (origin, callback) => callback(null, true),  // allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Must be BEFORE session
app.options('*', cors()); 

// JSON parser
app.use(express.json());

// Session (now AFTER CORS)
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/paintings', paintingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/artists', artistsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
