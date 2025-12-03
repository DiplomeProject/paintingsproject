require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 8080;

db.getConnection()
    .then(conn => {
        console.log('✅ Database connected');
        conn.release();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch(err => console.error('❌ DB connection failed:', err));