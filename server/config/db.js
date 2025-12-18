const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: "172.17.3.23",
  port: "3306",
  user: "artuser",
  password: "VRdQ1Q0KOydNJ413f>",
  database: "PaintingsDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Export the pool itself, not a wrapper
module.exports = pool;