# SQL Commands by File Location

This README contains all the SQL DDL and DML commands grouped exactly by the file in which they appear for the Enterprise Banking System.

## `database/schema.sql`

```sql
-- 1. Create Branch Table (from 3NF/BCNF design)
CREATE TABLE IF NOT EXISTS Branch (
    branch_id INT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50)
); 

-- 2. Create Customer Table (Normalized)
CREATE TABLE IF NOT EXISTS Customer (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_no VARCHAR(15),
    address TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- 3. Create Account Table (Linked to Customer and Branch)
CREATE TABLE IF NOT EXISTS Account (
    account_id INT PRIMARY KEY,
    customer_id INT,
    branch_id INT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('Savings', 'Current') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
); 

-- 4. Create Transaction Table
CREATE TABLE IF NOT EXISTS Transaction (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT,
    transaction_type ENUM('Deposit', 'Withdrawal', 'Transfer') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
); 

-- 5. Isolation Levels Reference
CREATE TABLE IF NOT EXISTS Isolation_Level (
    level_id INT PRIMARY KEY,
    level_name VARCHAR(50),
    description TEXT
); 

-- 6. Anomaly Log
CREATE TABLE IF NOT EXISTS Concurrency_Anomaly (
    anomaly_id INT PRIMARY KEY AUTO_INCREMENT,
    anomaly_type VARCHAR(50),
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Beneficiary Table
CREATE TABLE IF NOT EXISTS Beneficiary (
    beneficiary_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    beneficiary_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(50),
    branch_name VARCHAR(50),
    account_number VARCHAR(20) NOT NULL,
    IFSC_code VARCHAR(20),
    nick_name VARCHAR(50),
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- 8. Card Table
CREATE TABLE IF NOT EXISTS Card (
    card_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_type ENUM('Debit', 'Credit') NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    card_status VARCHAR(20) DEFAULT 'Active',
    daily_limit DECIMAL(10, 2),
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
);

-- 9. ATM Table
CREATE TABLE IF NOT EXISTS ATM (
    atm_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    location VARCHAR(255),
    city VARCHAR(50),
    installation_date DATE,
    atm_status VARCHAR(20) DEFAULT 'Active',
    cash_available DECIMAL(15, 2),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- 10. Loan Table
CREATE TABLE IF NOT EXISTS Loan (
    loan_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    loan_type VARCHAR(50),
    loan_amount DECIMAL(15, 2),
    interest_rate DECIMAL(5, 2),
    start_date DATE,
    end_date DATE,
    emi_amount DECIMAL(10, 2),
    loan_status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- 11. Payment Table
CREATE TABLE IF NOT EXISTS Payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT,
    account_id INT,
    payment_type VARCHAR(50),
    amount DECIMAL(15, 2),
    payment_date DATE,
    payment_time TIME,
    payment_status VARCHAR(20),
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
);

-- 12. Notification Table
CREATE TABLE IF NOT EXISTS Notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    message TEXT,
    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('SMS', 'Email'),
    status VARCHAR(20) DEFAULT 'Sent',
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);
```

## `database/seed.sql`

```sql
-- Insert Branches
INSERT IGNORE INTO Branch (branch_id, branch_name, city, state, ifsc_code) VALUES 
(101, 'Pune Branch', 'Pune', 'Maharashtra', 'PUNB000101'),
(102, 'Mumbai Branch', 'Mumbai', 'Maharashtra', 'MUMB000102'); 

-- Insert Customers
INSERT IGNORE INTO Customer (customer_id, first_name, last_name, email) VALUES 
(1, 'Rahul', 'Sharma', 'rahul@gmail.com'),
(2, 'Priya', 'Patil', 'priya@gmail.com'),
(3, 'Amit', 'Joshi', 'amit@gmail.com'); 

-- Insert Accounts
INSERT IGNORE INTO Account (account_id, customer_id, branch_id, account_number, account_type, balance) VALUES 
(201, 1, 101, 'ACC1001', 'Savings', 50000.00),
(202, 2, 102, 'ACC1002', 'Current', 75000.00); 

-- Insert ATM
INSERT IGNORE INTO ATM (atm_id, branch_id, location, city, cash_available, atm_status) VALUES 
(501, 101, 'Main Street Kiosk', 'Pune', 500000.00, 'Active');

-- Insert Card
INSERT IGNORE INTO Card (card_id, account_id, card_number, card_type, card_status, daily_limit) VALUES 
(801, 201, '4500123456789012', 'Debit', 'Active', 40000.00);

-- Insert Loan
INSERT IGNORE INTO Loan (loan_id, customer_id, loan_type, loan_amount, interest_rate, start_date, end_date, emi_amount, loan_status) VALUES 
(301, 1, 'Home Loan', 500000.00, 8.50, '2025-01-01', '2030-01-01', 5000.00, 'Active');

-- Insert Beneficiaries
INSERT IGNORE INTO Beneficiary (beneficiary_id, customer_id, beneficiary_name, bank_name, account_number, IFSC_code, nick_name) VALUES 
(1, 1, 'Priya Patil', 'Our Bank', 'ACC1002', 'MUMB000102', 'Priya'),
(2, 2, 'Rahul Sharma', 'Our Bank', 'ACC1001', 'PUNB000101', 'Rahul');

-- Insert Isolation Levels
INSERT IGNORE INTO Isolation_Level (level_id, level_name, description) VALUES 
(1, 'READ UNCOMMITTED', 'Allows dirty reads'),
(2, 'READ COMMITTED', 'Prevents dirty reads'),
(3, 'REPEATABLE READ', 'Prevents non-repeatable reads'),
(4, 'SERIALIZABLE', 'Full isolation, prevents phantom reads');

-- Insert Welcome Notification
INSERT IGNORE INTO Notification (notification_id, customer_id, message, type) VALUES 
(1, 1, 'Welcome to PCCOE Banking. Your account is active.', 'Email');
```

## `backend/server.js`

```sql
-- Fetch all accounts (GET /api/accounts)
SELECT a.account_id, c.first_name, c.last_name, a.balance, a.account_number 
FROM Account a 
JOIN Customer c ON a.customer_id = c.customer_id

-- CONCURRENCY DEMO 1: Web Transfer (POST /api/transfer-demo)
SET TRANSACTION ISOLATION LEVEL ?
SELECT balance FROM Account WHERE account_id = ? FOR UPDATE
UPDATE Account SET balance = balance - ? WHERE account_id = ?
UPDATE Account SET balance = balance + ? WHERE account_id = ?
INSERT INTO Transaction (account_id, transaction_type, amount, status) VALUES (?, ?, ?, ?)
INSERT INTO Notification (customer_id, message, type) VALUES ((SELECT customer_id FROM Account WHERE account_id = ?), ?, ?)

-- CONCURRENCY DEMO 2: ATM Withdrawal (POST /api/atm-withdrawal)
SET TRANSACTION ISOLATION LEVEL ?
SELECT account_id, daily_limit, card_status FROM Card WHERE card_number = ? FOR UPDATE
SELECT cash_available, atm_status FROM ATM WHERE atm_id = ? FOR UPDATE
SELECT balance FROM Account WHERE account_id = ? FOR UPDATE
UPDATE Account SET balance = balance - ? WHERE account_id = ?
UPDATE ATM SET cash_available = cash_available - ? WHERE atm_id = ?
INSERT INTO Transaction (account_id, transaction_type, amount, status) VALUES (?, ?, ?, ?)
INSERT INTO Notification (customer_id, message, type) VALUES ((SELECT customer_id FROM Account WHERE account_id = ?), ?, ?)
-- Fallback logging for deadlocks inside ATM catch block
INSERT INTO Concurrency_Anomaly (anomaly_type, description) VALUES (?, ?)

-- Fetch Notifications Inbox (GET /api/notifications)
SELECT * FROM Notification ORDER BY notification_time DESC LIMIT 20

-- Fetch Anomalies Console (GET /api/anomalies)
SELECT * FROM Concurrency_Anomaly ORDER BY detected_at DESC

-- Fetch Dashboard Metrics (GET /api/user-dashboard/:customerId)
SELECT b.beneficiary_name, a.account_id FROM Beneficiary b JOIN Account a ON b.account_number = a.account_number WHERE b.customer_id = ?
SELECT message, DATE_FORMAT(notification_time, '%H:%i:%s') as time, type FROM Notification WHERE customer_id = ? ORDER BY notification_id DESC LIMIT 5
SELECT loan_id, loan_type, loan_amount, emi_amount, loan_status FROM Loan WHERE customer_id = ?

-- CONCURRENCY DEMO 3: EMI Batch Processor (POST /api/process-emis)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
SELECT * FROM Loan WHERE loan_status = "Active"
SELECT account_id, balance FROM Account WHERE customer_id = ? FOR UPDATE
UPDATE Account SET balance = balance - ? WHERE account_id = ?
INSERT INTO Payment (loan_id, account_id, payment_type, amount, payment_date, payment_time, payment_status) VALUES (?, ?, ?, ?, CURDATE(), CURTIME(), ?)
INSERT INTO Notification (customer_id, message, type) VALUES (?, ?, ?)
```
