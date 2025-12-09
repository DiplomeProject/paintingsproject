const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const paintingRoutes = require('./routes/paintingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const commissions = require('./commissions/Commissions');
const artists = require('./Artists/Artists');

const app = express();

app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            'http://172.17.3.24:8080',
            'http://localhost:3000'
        ];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(session({
    secret: '3c1f9d8e7a4b2c0df5a98c4b7e1d263f8b4a1dce92f07bd38a6f2c51d47e9032',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }
}));

// Prefix all routes for consistency
app.use('/api', authRoutes);
app.use('/api', paintingRoutes);
app.use('/api', profileRoutes);
app.use('/api', searchRoutes);
app.use('/api', commissions);
app.use('/api', artists);

module.exports = app;
