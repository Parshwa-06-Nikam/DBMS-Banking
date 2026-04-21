require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
  try {
    const rawConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    console.log("Connected to MySQL server successfully!");

    try {
      await rawConnection.query(`USE \`${process.env.DB_NAME || 'banking_dbms'}\``);
      console.log(`Successfully selected database: ${process.env.DB_NAME || 'banking_dbms'}`);
      
      const [tables] = await rawConnection.query("SHOW TABLES");
      console.log("Tables in database:");
      console.log(tables.map(t => Object.values(t)[0]));
    } catch (dbErr) {
      console.error("Error selecting database:", dbErr.message);
    }
    
    await rawConnection.end();
  } catch (err) {
    console.error("MySQL connection error:", err);
  }
}

check();
