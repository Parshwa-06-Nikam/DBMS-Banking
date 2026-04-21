const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Fetch all accounts (Matches your Account Table design)
app.get('/api/accounts', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.account_id, c.first_name, c.last_name, a.balance, a.account_number 
            FROM Account a 
            JOIN Customer c ON a.customer_id = c.customer_id
        `); 
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CONCURRENCY DEMO: Transfer with intentional delay
app.post('/api/transfer-demo', async (req, res) => {
    const { fromId, toId, amount, isolationLevel } = req.body;
    const connection = await pool.getConnection();

    try {
        // Set the Isolation Level dynamically based on user selection
        await connection.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
        await connection.beginTransaction();

        // Step 1: Check balance with a LOCK
        const [rows] = await connection.query('SELECT balance FROM Account WHERE account_id = ? FOR UPDATE', [fromId]);
        
        if (rows.length === 0) {
            throw new Error(`Account ID ${fromId} not found`);
        }
        if (rows[0].balance < amount) {
            throw new Error('Insufficient funds');
        }

        // ARTIFICIAL DELAY (5 seconds) 
        // This lets you start another transaction while this one is "Locked"
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 2: Update balances
        await connection.query('UPDATE Account SET balance = balance - ? WHERE account_id = ?', [amount, fromId]);
        await connection.query('UPDATE Account SET balance = balance + ? WHERE account_id = ?', [amount, toId]);

        // Log the Transaction
        await connection.query(
            'INSERT INTO Transaction (account_id, transaction_type, amount, status) VALUES (?, ?, ?, ?)',
            [fromId, 'Transfer', amount, 'Success']
        );

        // Send a Notification
        await connection.query(
            'INSERT INTO Notification (customer_id, message, type) VALUES ((SELECT customer_id FROM Account WHERE account_id = ?), ?, ?)',
            [fromId, `₹${amount} transferred from Account ${fromId} to Account ${toId}.`, 'Email']
        );

        await connection.commit();
        res.json({ message: 'Transaction Committed Successfully!' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Transaction Failed / Anomaly Detected: ' + err.message });
    } finally {
        connection.release();
    }
});

// 3. CONCURRENCY DEMO 2: ATM Withdrawal Simulator
app.post('/api/atm-withdrawal', async (req, res) => {
    const { cardNumber, atmId, amount, isolationLevel } = req.body;
    const connection = await pool.getConnection();

    try {
        // Set dynamic isolation level
        await connection.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
        await connection.beginTransaction();

        console.log(`[ATM] Starting withdrawal of ₹${amount} at ATM ${atmId}...`);

        // Lock 1: Lock the Card and verify limits
        const [cardRows] = await connection.query(
            'SELECT account_id, daily_limit, card_status FROM Card WHERE card_number = ? FOR UPDATE', 
            [cardNumber]
        );
        if (cardRows.length === 0 || cardRows[0].card_status !== 'Active') throw new Error('Invalid or Inactive Card');
        if (amount > cardRows[0].daily_limit) throw new Error('Daily limit exceeded');
        
        const accountId = cardRows[0].account_id;

        // Lock 2: Lock the ATM and check cash availability
        const [atmRows] = await connection.query(
            'SELECT cash_available, atm_status FROM ATM WHERE atm_id = ? FOR UPDATE', 
            [atmId]
        );
        if (atmRows.length === 0 || atmRows[0].atm_status !== 'Active') throw new Error('ATM Offline');
        if (atmRows[0].cash_available < amount) throw new Error('ATM has insufficient cash');

        // Lock 3: Lock the Account to check user balance (The point of concurrency conflict!)
        const [accRows] = await connection.query(
            'SELECT balance FROM Account WHERE account_id = ? FOR UPDATE', 
            [accountId]
        );
        if (accRows[0].balance < amount) throw new Error('Insufficient account balance');

        // ARTIFICIAL DELAY (5 Seconds) to allow you to trigger a simultaneous web transfer
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Deduct from Account
        await connection.query('UPDATE Account SET balance = balance - ? WHERE account_id = ?', [amount, accountId]);
        
        // Deduct from ATM
        await connection.query('UPDATE ATM SET cash_available = cash_available - ? WHERE atm_id = ?', [amount, atmId]);

        // Log the Transaction
        await connection.query(
            'INSERT INTO Transaction (account_id, transaction_type, amount, status) VALUES (?, ?, ?, ?)', 
            [accountId, 'Withdrawal', amount, 'Success']
        );

        // Send a Notification (Matches ER Diagram)
        await connection.query(
            'INSERT INTO Notification (customer_id, message, type) VALUES ((SELECT customer_id FROM Account WHERE account_id = ?), ?, ?)',
            [accountId, `₹${amount} withdrawn from ATM ${atmId}.`, 'SMS']
        );

        await connection.commit();
        res.json({ message: 'Please collect your cash!' });

    } catch (err) {
        await connection.rollback();
        
        // Log the anomaly if it's a deadlock or timeout
        if (err.code === 'ER_LOCK_DEADLOCK' || err.code === 'ER_LOCK_WAIT_TIMEOUT') {
             await pool.query(
                'INSERT INTO Concurrency_Anomaly (anomaly_type, description) VALUES (?, ?)',
                ['Lock Wait/Deadlock', `ATM conflict on card ${req.body.cardNumber}: ${err.message}`]
            );
        }
        
        res.status(500).json({ error: 'Transaction Failed: ' + err.message });
    } finally {
        connection.release();
    }
});

// 4. Fetch notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Notification ORDER BY notification_time DESC LIMIT 20');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Fetch anomalies log
app.get('/api/anomalies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Concurrency_Anomaly ORDER BY detected_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. User Dashboard: Beneficiaries, Notifications, Loans for a Customer
app.get('/api/user-dashboard/:customerId', async (req, res) => {
    try {
        const [beneficiaries] = await pool.query(`
            SELECT b.beneficiary_name, a.account_id 
            FROM Beneficiary b 
            JOIN Account a ON b.account_number = a.account_number 
            WHERE b.customer_id = ?
        `, [req.params.customerId]);

        const [notifications] = await pool.query(`
            SELECT message, DATE_FORMAT(notification_time, '%H:%i:%s') as time, type 
            FROM Notification WHERE customer_id = ? ORDER BY notification_id DESC LIMIT 5
        `, [req.params.customerId]);

        const [loans] = await pool.query(`
            SELECT loan_id, loan_type, loan_amount, emi_amount, loan_status 
            FROM Loan WHERE customer_id = ?
        `, [req.params.customerId]);

        res.json({ beneficiaries, notifications, loans });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. CONCURRENCY DEMO 3: End-of-Day Loan EMI Batch Processing
app.post('/api/process-emis', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        // Find all active loans
        const [loans] = await connection.query('SELECT * FROM Loan WHERE loan_status = "Active"');
        let processed = 0;

        for (const loan of loans) {
            // Find the primary account for this customer and LOCK it
            const [accounts] = await connection.query(
                'SELECT account_id, balance FROM Account WHERE customer_id = ? FOR UPDATE', 
                [loan.customer_id]
            );
            
            if (accounts.length > 0) {
                const acc = accounts[0];
                if (acc.balance >= loan.emi_amount) {
                    // Deduct EMI
                    await connection.query('UPDATE Account SET balance = balance - ? WHERE account_id = ?', 
                        [loan.emi_amount, acc.account_id]);
                    // Record Payment
                    await connection.query(
                        'INSERT INTO Payment (loan_id, account_id, payment_type, amount, payment_date, payment_time, payment_status) VALUES (?, ?, ?, ?, CURDATE(), CURTIME(), ?)', 
                        [loan.loan_id, acc.account_id, 'EMI Auto-Deduct', loan.emi_amount, 'Success']
                    );
                    // Notify User
                    await connection.query('INSERT INTO Notification (customer_id, message, type) VALUES (?, ?, ?)',
                        [loan.customer_id, `₹${loan.emi_amount} deducted for ${loan.loan_type} EMI.`, 'SMS']);
                    processed++;
                } else {
                    // Notify Failure
                    await connection.query('INSERT INTO Notification (customer_id, message, type) VALUES (?, ?, ?)',
                        [loan.customer_id, `EMI payment failed for ${loan.loan_type} due to low balance.`, 'Email']);
                }
            }
        }

        // Artificial delay to allow concurrent testing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await connection.commit();
        res.json({ message: `Successfully processed EMIs for ${processed} account(s).` });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Batch processing failed: ' + err.message });
    } finally {
        connection.release();
    }
});

const PORT = 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

