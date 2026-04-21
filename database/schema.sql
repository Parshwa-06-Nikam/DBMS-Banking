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
    level_name VARCHAR(50), -- e.g., READ COMMITTED, SERIALIZABLE
    description TEXT
); 

-- 6. Anomaly Log (To show Dirty Reads/Phantom Reads in the Demo)
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

-- 11. Payment Table (Linked to Loans)
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
