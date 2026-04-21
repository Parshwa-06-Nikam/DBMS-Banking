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

-- Insert ATM (Pune Branch)
INSERT IGNORE INTO ATM (atm_id, branch_id, location, city, cash_available, atm_status) VALUES 
(501, 101, 'Main Street Kiosk', 'Pune', 500000.00, 'Active');

-- Insert Card (Rahul's Debit Card linked to Account 201)
INSERT IGNORE INTO Card (card_id, account_id, card_number, card_type, card_status, daily_limit) VALUES 
(801, 201, '4500123456789012', 'Debit', 'Active', 40000.00);

-- Insert Loan (Rahul's Home Loan - EMI ₹5,000)
INSERT IGNORE INTO Loan (loan_id, customer_id, loan_type, loan_amount, interest_rate, start_date, end_date, emi_amount, loan_status) VALUES 
(301, 1, 'Home Loan', 500000.00, 8.50, '2025-01-01', '2030-01-01', 5000.00, 'Active');

-- Insert Beneficiaries
INSERT IGNORE INTO Beneficiary (beneficiary_id, customer_id, beneficiary_name, bank_name, account_number, IFSC_code, nick_name) VALUES 
(1, 1, 'Priya Patil', 'Our Bank', 'ACC1002', 'MUMB000102', 'Priya'),
(2, 2, 'Rahul Sharma', 'Our Bank', 'ACC1001', 'PUNB000101', 'Rahul');

-- Insert Isolation Level references
INSERT IGNORE INTO Isolation_Level (level_id, level_name, description) VALUES 
(1, 'READ UNCOMMITTED', 'Allows dirty reads - transactions can see uncommitted changes from other transactions'),
(2, 'READ COMMITTED', 'Prevents dirty reads - only sees data committed before the query began'),
(3, 'REPEATABLE READ', 'Prevents non-repeatable reads - same query returns same results within a transaction'),
(4, 'SERIALIZABLE', 'Full isolation - transactions execute as if they were serial, prevents phantom reads');

-- Insert Welcome Notification
INSERT IGNORE INTO Notification (notification_id, customer_id, message, type) VALUES 
(1, 1, 'Welcome to PCCOE Banking. Your account is active.', 'Email');
