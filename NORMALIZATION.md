# Database Normalization

Normalization is an essential practice in database design utilized heavily in this project to minimize data redundancy and prevent data modification anomalies.

Our database schema conforms to **Boyce-Codd Normal Form (BCNF)**. Here is how constraints at each normalization level are fulfilled by the application:

### First Normal Form (1NF)
* **Rule:** Each column must be atomic (indivisible) and each record must be unique.
* **Implementation:** Instead of storing multiple card numbers in an `Account` table using comma-separated strings context, we created a dedicated `Card` table where each card has a unique, atomic `card_id` and specific limits.

### Second Normal Form (2NF)
* **Rule:** Meet 1NF criteria and ensure that all non-key attributes are fully functionally dependent on the primary key (eliminating partial dependencies).
* **Implementation:** Our `Branch` details (like branch address or city) are isolated inside the `Branch` table. If these fields lived inside the `Account` table which uses a composite logic, the branch address would be partially dependent, repeating continuously.

### Third Normal Form (3NF)
* **Rule:** Meet 2NF criteria and eliminate transitive dependencies (non-key columns must not depend on other non-key columns).
* **Implementation:** In the `Customer` table, user details like email and phone number depend strictly on the `customer_id`. The `Account` table simply references `customer_id` and does not carry over the customer's name, preventing data anomalies if the user changes their name.

### Boyce-Codd Normal Form (BCNF)
* **Rule:** A stricter version of 3NF where every determinent is a candidate key.
* **Implementation:** By ensuring `branch_id` dictates branch data and `card_id` dictates card-limit constraints perfectly without any cross-referential ambiguity, we ensure strict structural boundaries across the 12 primary tables.
