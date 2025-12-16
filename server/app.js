const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const paintingRoutes = require('./routes/paintingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const commissionsRoutes = require('./commissions/Commissions');
const chatRoutes = require('./commissions/chat');
const artistsRoutes = require('./Artists/Artists');
const fondyRoutes = require('./routes/fondyRoutes');

const app = express();

const corsOptions = {
    // FIX: Use explicit origins for security and compatibility with credentials: true
    origin: [
        'http://172.17.3.24:8080',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
    allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization']
};

// CORS MUST BE FIRST
app.use(cors(corsOptions));
// This ensures the cors middleware handles the preflight check correctly
// app.options('*', cors(corsOptions));

// JSON parser (allow larger payloads for base64 image uploads)
app.use(express.json({ limit: '15mb' }));
// also accept urlencoded bodies with same limit
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// session
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
// Mount chat route BEFORE the generic commissions router to avoid
// the generic `/:id` handlers capturing the `chat` segment.
app.use('/api/commissions/chat', chatRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/fondy', fondyRoutes);

// Compatibility mounts for older client paths that omit the /api prefix
app.use('/auth', authRoutes);
app.use('/commissions', commissionsRoutes);
app.use('/commissions/chat', chatRoutes);

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