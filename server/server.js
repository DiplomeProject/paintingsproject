require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 8080;

db.getConnection()
    .then(conn => {
        console.log('✅ Database connected');
        conn.release();
        // create http server and initialize socket.io
        const http = require('http');
        const server = http.createServer(app);
        const { init } = require('./socket');
        init(server);

        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ DB connection failed:', err));