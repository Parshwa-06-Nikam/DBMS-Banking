# Database Normalization

This document outlines the normalization steps (1NF, 2NF, 3NF) applied to the Enterprise Banking System database to avoid data anomalies and ensure data integrity.

## 1. First Normal Form (1NF)
**Rule:** Ensure atomicity. Each column must contain atomic (single) values. There should be no repeating groups or arrays. Every table must have a Primary Key.

**Example: `Card` Table**

If unnormalized, a single row might contain a list of debit/credit card numbers linked to an account.

❌ **BEFORE 1NF:**
```text
account_id | card_numbers
1          | 45001234, 55001234
```

✅ **AFTER 1NF (Our implementation):**
```text
Card
+---------+------------+-------------+
| card_id | account_id | card_number |
+---------+------------+-------------+
|    1    |     1      | 45001234    |
|    2    |     1      | 55001234    |
+---------+------------+-------------+
```
**Result:** Each row now holds a single card. `card_id` serves as the primary key. Repeating groups are completely eliminated.

---

## 2. Second Normal Form (2NF)
**Rule:** Ensure 1NF and eliminate partial dependencies. Every non-key attribute must depend on the entire primary key (this primarily applies to composite primary keys).

**Example: `Account` and `Branch` Tables**

Suppose we initially tracked accounts and the branch's details in a single table mapped by a composite key (like `account_id` and `branch_id`).

❌ **BEFORE 2NF (Hypothetical):** Imagine a table with PK (`account_id`, `branch_id`):
```text
account_id | branch_id | balance | branch_city | ifsc_code
1          | 101       | 5000    | Mumbai      | SBIN0001
```
*Problem:* `branch_city` and `ifsc_code` depend only on `branch_id`, not on the full composite key (`account_id`, `branch_id`). This is a partial dependency.

✅ **AFTER 2NF (Our implementation):** We separated the branch details into its own table.

```text
Account
+------------+-----------+---------+
| account_id | branch_id | balance |
+------------+-----------+---------+
|     1      |   101     | 5000    |
+------------+-----------+---------+

Branch
+-----------+-------------+-----------+
| branch_id | branch_city | ifsc_code |
+-----------+-------------+-----------+
|   101     | Mumbai      | SBIN0001  |
+-----------+-------------+-----------+
```
**Result:** `branch_city` and `ifsc_code` now reside in `Branch` and depend entirely on its primary key, `branch_id`.

---

## 3. Third Normal Form (3NF)
**Rule:** Ensure 2NF and eliminate transitive dependencies. No non-key attribute should depend on another non-key attribute.

**Example: `Account` and `Customer` Tables**

❌ **BEFORE 3NF:**
```text
Account
+------------+-------------+------------+---------------+---------+
| account_id | customer_id | first_name | email         | balance |
+------------+-------------+------------+---------------+---------+
|     1      |      1      | Rahul      | ra@email.com  | 5000    |
+------------+-------------+------------+---------------+---------+
```
*Problem:* `first_name` and `email` depend on `customer_id` (a non-key attribute in this table), not directly on `account_id` (the primary key). (`account_id` -> `customer_id` -> `first_name`).

✅ **AFTER 3NF (Our implementation):** We split personal details into the `Customer` table.

```text
Account
+------------+-------------+---------+
| account_id | customer_id | balance |
+------------+-------------+---------+
|     1      |      1      | 5000    |
+------------+-------------+---------+

Customer
+-------------+------------+---------------+
| customer_id | first_name | email         |
+-------------+------------+---------------+
|      1      | Rahul      | ra@email.com  |
+-------------+------------+---------------+
```
**Result:** Transitive dependencies are removed. Personal details reside in the `Customer` table, depending solely on `customer_id`.

---

## 4. Avoiding Data Anomalies
Normalization eliminates these common database anomalies:

### 1. Insert Anomaly (Avoided)
* **Problem:** If `branch_name` and `ifsc_code` were stored inside `Account`, you could not add a new Branch to the system until a customer physically opened an account at that branch.
* **Solution (Our implementation):** We have a separate `Branch` table. We can insert a new branch independently of any accounts.
```sql
INSERT INTO Branch (branch_id, branch_name, ifsc_code)
VALUES (105, 'Pune Main', 'SBIN0005');
```

### 2. Update Anomaly (Avoided)
* **Problem:** If "Mumbai" was stored in 5000 rows of a monolithic `Account` table, changing the branch's city name (e.g., to "Navi Mumbai") would require updating all 5000 rows simultaneously, risking severe inconsistencies.
* **Solution (Our implementation):** The name is stored exactly once in `Branch`.
```sql
UPDATE Branch
SET city = 'Navi Mumbai'
WHERE branch_id = 101;
```
This single update is instantly reflected across all 5000 related accounts automatically.

### 3. Delete Anomaly (Avoided)
* **Problem:** If customer details, balances, and loans were all stored in one table, deleting a completed loan record might accidentally delete the user's permanent personal information.
* **Solution (Our implementation):** Entities are cleanly separated.
```sql
DELETE FROM Loan
WHERE loan_id = 7;
```
This command securely deletes only the specific loan record. The corresponding `Customer` and `Account` records remain perfectly intact.
