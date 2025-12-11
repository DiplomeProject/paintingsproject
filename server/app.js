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

// 1. UPDATE: Add your specific frontend IP here. 
// Do not use '*' or generic callbacks when credentials are strictly required.
const corsOptions = {
    origin: [
        'http://172.17.3.24:8080', 
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

// 2. APPLY CORS: Apply it immediately, before any other middleware
app.use(cors(corsOptions));

// 3. REMOVED: The manual "app.use" for OPTIONS was deleted here. 
// The cors() middleware above automatically handles headers, 
// and Express handles the OPTIONS response status by default or via the line below.

// Enable pre-flight for all routes
app.options('*', cors(corsOptions));

// JSON parser
app.use(express.json());

// session
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax' // Important for CORS/Cookies across different ports
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