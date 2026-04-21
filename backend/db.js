const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banking_dbms',
  waitForConnections: true,
  connectionLimit: 10
});

// Check database connection and log status
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.code || err.message || err);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 TIP: MySQL server is not running or not reachable on port 3306.');
      console.error('   Please open XAMPP (or your MySQL service) and click "Start" next to MySQL.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 TIP: Access denied. Check your DB_USER and DB_PASSWORD in the .env file.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`👉 TIP: Database '${process.env.DB_NAME || 'banking_dbms'}' does not exist.`);
      console.error('   Please create it using your SQL tool or run the setup command.');
    }
  });

module.exports = pool;
