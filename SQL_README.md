# SQL Engine & Execution Scripts

This document serves as an index for the SQL architecture powering the backend of the Banking DBMS.

## The `database/` Directory

### 1. `schema.sql`
This script acts as the structural foundation of the database. It contains `CREATE TABLE` instructions executed sequentially.
**Key SQL Features Utilized:**
* `PRIMARY KEY AUTO_INCREMENT` for zero-friction ID generation.
* `UNIQUE` constraints to safeguard critical parameters like `card_number` and `account_number`.
* `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` for reliable internal transaction auditing.
* `ENUM` data types to enforce strict categories (e.g., `ENUM('Savings', 'Current')`).
* Strict `FOREIGN KEY` constraints.

### 2. `seed.sql`
This script injects the mock environment into the schema tables.
* Seeds branch locations and initial cash availability inside ATMs.
* Mentally maps demo customers to testing accounts.
* Establishes dynamic limits for debit cards linked to said demo accounts.

## Interacting with the Node Backend (`mysql2`)
Our backend connects to MySQL using a Connection Pool (`pool.getConnection()`) allowing concurrent connections.

When executing high-risk operations (ATM transfers), the Node Server executes these critical raw queries via the `mysql2` API:
```sql
-- Dynamic Isolation Level mapping based on UI testing tool
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;

-- Lock Target Row implicitly stopping Read anomalies
SELECT balance FROM Account WHERE account_id = ? FOR UPDATE;

UPDATE Account SET balance = balance - ? WHERE account_id = ?;

COMMIT;
```
