require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDB() {
  try {
    const dbName = process.env.DB_NAME || 'banking_dbms';
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    console.log("Connected to MySQL server successfully!");

    await db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await db.query(`USE \`${dbName}\``);
    console.log(`Database '${dbName}' is ready to use!`);

    const schema = `
      SET FOREIGN_KEY_CHECKS = 0;
      
      DROP TABLE IF EXISTS Payment;
      DROP TABLE IF EXISTS Loan;
      DROP TABLE IF EXISTS Beneficiary;
      DROP TABLE IF EXISTS Concurrency_Anomaly;
      DROP TABLE IF EXISTS ATM;
      DROP TABLE IF EXISTS Card;
      DROP TABLE IF EXISTS Notification;
      DROP TABLE IF EXISTS Transaction;
      DROP TABLE IF EXISTS Account;
      DROP TABLE IF EXISTS Customer;

      SET FOREIGN_KEY_CHECKS = 1;

      CREATE TABLE Customer (
          customer_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(50),
          last_name VARCHAR(50)
      );

      CREATE TABLE Account (
          account_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          balance DECIMAL(15, 2),
          account_number VARCHAR(20) UNIQUE,
          FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      );

      CREATE TABLE Transaction (
          transaction_id INT AUTO_INCREMENT PRIMARY KEY,
          account_id INT,
          transaction_type VARCHAR(50),
          amount DECIMAL(15, 2),
          status VARCHAR(50),
          transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (account_id) REFERENCES Account(account_id)
      );

      CREATE TABLE Notification (
          notification_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          message TEXT,
          type VARCHAR(50),
          notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      );

      CREATE TABLE Card (
          card_number VARCHAR(20) PRIMARY KEY,
          account_id INT,
          daily_limit DECIMAL(10, 2),
          card_status VARCHAR(50),
          FOREIGN KEY (account_id) REFERENCES Account(account_id)
      );

      CREATE TABLE ATM (
          atm_id INT PRIMARY KEY,
          cash_available DECIMAL(15, 2),
          atm_status VARCHAR(50),
          location VARCHAR(100)
      );

      CREATE TABLE Concurrency_Anomaly (
          anomaly_id INT AUTO_INCREMENT PRIMARY KEY,
          anomaly_type VARCHAR(100),
          description TEXT,
          detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE Beneficiary (
          beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          beneficiary_name VARCHAR(100),
          account_number VARCHAR(20),
          FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      );

      CREATE TABLE Loan (
          loan_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          loan_type VARCHAR(50),
          loan_amount DECIMAL(15, 2),
          emi_amount DECIMAL(10, 2),
          loan_status VARCHAR(50),
          next_emi_date DATE,
          FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      );

      CREATE TABLE Payment (
          payment_id INT AUTO_INCREMENT PRIMARY KEY,
          loan_id INT,
          account_id INT,
          payment_type VARCHAR(50),
          amount DECIMAL(15, 2),
          payment_date DATE,
          payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          payment_status VARCHAR(50),
          FOREIGN KEY (loan_id) REFERENCES Loan(loan_id),
          FOREIGN KEY (account_id) REFERENCES Account(account_id)
      );

      -- 1. Insert Expanded Demographics
      INSERT INTO Customer (first_name, last_name) VALUES 
      ('Rahul', 'Sharma'),
      ('Priya', 'Patel'),
      ('Amit', 'Singh'),
      ('Sneha', 'Gupta'),
      ('Vikram', 'Malhotra'),
      ('Neha', 'Desai'),
      ('Rohan', 'Kapoor'),
      ('Pooja', 'Iyer'),
      ('Arjun', 'Reddy'),
      ('Anjali', 'Verma');

      -- 2. Insert Accounts (1 for each customer)
      INSERT INTO Account (customer_id, balance, account_number) VALUES 
      (1, 150000.00, 'ACC10001'),
      (2, 275000.00, 'ACC10002'),
      (3, 10000.00, 'ACC10003'),
      (4, 520000.00, 'ACC10004'),
      (5, 85000.00, 'ACC10005'),
      (6, 340000.00, 'ACC10006'),
      (7, 12000.00, 'ACC10007'),
      (8, 950000.00, 'ACC10008'),
      (9, 45000.00, 'ACC10009'),
      (10, 67000.00, 'ACC10010');

      -- 3. Insert Active & Inactive Cards (Card ending in 9012 matches your UI screenshot)
      INSERT INTO Card (card_number, account_id, daily_limit, card_status) VALUES 
      ('4500123456789012', 1, 40000.00, 'Active'),
      ('4500123456789013', 2, 50000.00, 'Active'),
      ('4500123456789014', 3, 20000.00, 'Active'),
      ('4500123456789015', 4, 100000.00, 'Active'),
      ('4500123456789016', 5, 25000.00, 'Blocked'),
      ('4500123456789017', 8, 200000.00, 'Active');

      -- 4. Insert ATMs (Including the Pune Kiosk from the UI)
      INSERT INTO ATM (atm_id, cash_available, atm_status, location) VALUES 
      (501, 500000.00, 'Active', 'Pune Kiosk - MG Road'),
      (502, 150000.00, 'Active', 'Mumbai - Andheri East'),
      (503, 0.00, 'Maintenance', 'Delhi - Connaught Place'),
      (504, 800000.00, 'Active', 'Bangalore - Indiranagar');

      -- 5. Insert Beneficiaries (Creates a web of connections for concurrency transfers)
      INSERT INTO Beneficiary (customer_id, beneficiary_name, account_number) VALUES 
      (1, 'Priya Patel', 'ACC10002'),
      (1, 'Amit Singh', 'ACC10003'),
      (2, 'Rahul Sharma', 'ACC10001'),
      (3, 'Sneha Gupta', 'ACC10004'),
      (4, 'Arjun Reddy', 'ACC10009'),
      (5, 'Neha Desai', 'ACC10006'),
      (8, 'Rahul Sharma', 'ACC10001'),
      (10, 'Priya Patel', 'ACC10002');

      -- 6. Insert Loans (Fixed FK mappings, added next_emi_date for your Batch Job)
      INSERT INTO Loan (customer_id, loan_type, loan_amount, emi_amount, loan_status, next_emi_date) VALUES 
      (3, 'Personal Loan', 500000.00, 15000.00, 'Active', '2026-04-01'),
      (1, 'Car Loan', 800000.00, 22500.00, 'Active', '2026-04-05'),
      (2, 'Home Loan', 2500000.00, 35000.00, 'Active', '2026-04-10'),
      (4, 'Education Loan', 600000.00, 15000.00, 'Closed', NULL),
      (5, 'Gold Loan', 200000.00, 8000.00, 'Active', '2026-04-02'),
      (6, 'Business Loan', 1200000.00, 42000.00, 'Active', '2026-04-15'),
      (2, 'Car Loan', 700000.00, 18000.00, 'Closed', NULL),
      (7, 'Personal Loan', 300000.00, 9000.00, 'Active', '2026-04-01'),
      (8, 'Home Loan', 3500000.00, 45000.00, 'Active', '2026-04-07'),
      (9, 'Education Loan', 450000.00, 12500.00, 'Active', '2026-04-20');

      -- 7. Insert Historical Transactions (So live balances don't look static)
      INSERT INTO Transaction (account_id, transaction_type, amount, status) VALUES
      (1, 'CREDIT', 50000.00, 'SUCCESS'),
      (2, 'CREDIT', 120000.00, 'SUCCESS'),
      (3, 'DEBIT', 5000.00, 'SUCCESS'),
      (1, 'DEBIT', 2000.00, 'SUCCESS'),
      (8, 'CREDIT', 500000.00, 'SUCCESS'),
      (5, 'DEBIT', 1000.00, 'FAILED - INSUFFICIENT FUNDS');

      -- 8. Insert Historical Loan Payments
      INSERT INTO Payment (loan_id, account_id, payment_type, payment_date, amount, payment_status) VALUES
      (1, 3, 'EMI Auto-Debit', '2026-02-01', 15000.00, 'SUCCESS'),
      (1, 3, 'EMI Auto-Debit', '2026-03-01', 15000.00, 'SUCCESS'),
      (2, 1, 'EMI Auto-Debit', '2026-03-05', 22500.00, 'SUCCESS'),
      (5, 5, 'EMI Auto-Debit', '2026-03-02', 8000.00, 'FAILED');

      -- 9. Insert Initial Notifications
      INSERT INTO Notification (customer_id, message, type) VALUES 
      (1, 'Security Alert: New login detected from Pune.', 'EMAIL'),
      (3, 'Reminder: Your EMI of ₹15,000 is due on 1st April.', 'SMS'),
      (5, 'Alert: EMI Auto-debit failed due to insufficient funds.', 'SMS'),
      (8, 'Congratulations! Your Home Loan has been disbursed.', 'EMAIL');
`;

    await db.query(schema);
    console.log("✅ Schema created and Indian demo data inserted successfully!");

    await db.end();
  } catch (err) {
    console.error("❌ Setup error:", err.code || err.message || err);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 TIP: MySQL server is not running or not reachable on port 3306.');
      console.error('   Please open XAMPP (or your MySQL service) and click "Start" next to MySQL.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 TIP: Access denied. Check your DB_USER and DB_PASSWORD in your .env file.');
    }
  }
}

initializeDB();
