# Concurrency Anomalies & Database Locks

In any multi-user database application such as our Banking DBMS, many transactions occur concurrently. If not properly controlled, concurrent transactions can lead to data integrity issues known as **Concurrency Anomalies**.

## Types of Anomalies Addressed

### 1. Dirty Read
Occurs when Transaction A reads data that Transaction B has modified but not yet committed. If B rolls back its changes, A will be working with "dirty" (invalid) data.
* **Solution in Project:** This is prevented by using `READ COMMITTED` or stricter isolation levels.

### 2. Non-Repeatable Read
Occurs when a transaction reads the same row twice, but gets different data each time because another transaction modified the row and committed during the interval.
* **Solution in Project:** Our system demonstrates `REPEATABLE READ` to ensure read locks are held, ensuring the row data won't change mid-transaction.

### 3. Phantom Read
Occurs when a transaction executes a query returning a set of rows, but another transaction inserts or deletes rows matching the query condition before the first transaction commits.
* **Solution in Project:** Addressed by using the `SERIALIZABLE` isolation level, which places range locks to prevent new row insertions in the queried range. Our **EMI Batch Processor** uses this level to prevent new loans from being approved during the batch job.

## Lock Strategies Implemented

### The `FOR UPDATE` Lock
In our ATM and web transfer modules, we utilize pessimistic locking via `SELECT ... FOR UPDATE`.
* **Example:** Before deducting an ATM withdrawal, we lock the Card, ATM, and Account row.
* **Benefit:** This temporarily blocks any other transaction from reading or modifying these rows, completely eliminating race conditions.

### Deadlocks
A **deadlock** occurs when two transactions each hold locks that the other transaction requires to proceed.
* **In our Lab:** If an ATM withdrawal and a Web Transfer target the exact same account at the exact same millisecond, MySQL's InnoDB engine detects the cyclic dependency and aborts one transaction (Error: `ER_LOCK_DEADLOCK`).
* Our Node.js backend catches this anomaly and logs it into the `Concurrency_Anomaly` table.
