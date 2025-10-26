const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 8080;

db.getConnection()
    .then(conn => {
        console.log('✅ Database connected');
        conn.release();
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ DB connection failed:', err));
