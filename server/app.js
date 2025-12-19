require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const paintingRoutes = require('./routes/paintingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const commissionsRoutes = require('./commissions/Commissions');
const chatRoutes = require('./commissions/chat');
const artistsRoutes = require('./Artists/Artists');
const fondyRoutes = require('./routes/fondyRoutes');

const app = express();

app.set('trust proxy', 1);

// отключаем ETag, чтобы не было 304
app.set('etag', false);

// ✅ CORS (ТОЛЬКО HTTPS ДОМЕН)
const corsOptions = {
  origin: ['https://bestartgallery.pp.ua', 'http://172.17.3.23:8080'],
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// CORS должен быть ПЕРВЫМ
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ✅ session (HTTPS)
app.use(session({
  name: 'bestart.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // ОБЯЗАТЕЛЬНО для HTTPS
    httpOnly: true,
    sameSite: 'none',    // ОБЯЗАТЕЛЬНО для cross-origin
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// запрет кеширования API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/paintings', paintingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/commissions/chat', chatRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/fondy', fondyRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error("FULL ERROR LOG:", err); // Check your server terminal/console for this!
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message, // This will show you exactly what database column or connection failed
    stack: err.stack      // This shows exactly which line of code broke
  });
});

module.exports = app;
