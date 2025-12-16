const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "PaintingsDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Export the pool itself, not a wrapper
module.exports = pool;
