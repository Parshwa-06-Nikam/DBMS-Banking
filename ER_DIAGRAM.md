# Entity-Relationship (ER) Architecture

The Enterprise Banking DBMS uses a fully normalized schema designed to maintain referential integrity and support highly concurrent scaling.

![ER Diagram](./er_diagram.png)

## Database Flowchart

Below is a Mermaid flowchart representing the Entity relationships and Foreign Key constraints.

```mermaid
erDiagram
    Branch ||--o{ Account : "Hosts"
    Branch ||--o{ ATM : "Maintains"
    
    Customer ||--o{ Account : "Owns"
    Customer ||--o{ Beneficiary : "Saves"
    Customer ||--o{ Loan : "Applies for"
    Customer ||--o{ Notification : "Receives"
    
    Account ||--o{ Transaction : "Logs"
    Account ||--o{ Card : "Linked to"
    Account ||--o{ Payment : "Used for"
    
    Loan ||--o{ Payment : "Settled by"

    Customer {
        int customer_id PK
        string first_name
        string last_name
        string email
        string phone_no
        string address
        timestamp created_date
    }
    Branch {
        int branch_id PK
        string branch_name
        string ifsc_code
        string address
        string city
        string state
    }
    Account {
        int account_id PK
        int customer_id FK
        int branch_id FK
        string account_number
        string account_type
        decimal balance
        string status
    }
    Transaction {
        int transaction_id PK
        int account_id FK
        string transaction_type
        decimal amount
        string status
        timestamp start_time
        timestamp end_time
    }
    ATM {
        int atm_id PK
        int branch_id FK
        string location
        string city
        date installation_date
        string atm_status
        decimal cash_available
    }
    Card {
        int card_id PK
        int account_id FK
        string card_number
        string card_type
        date issue_date
        date expiry_date
        string card_status
        decimal daily_limit
    }
    Loan {
        int loan_id PK
        int customer_id FK
        string loan_type
        decimal loan_amount
        decimal interest_rate
        date start_date
        date end_date
        decimal emi_amount
        string loan_status
    }
    Payment {
        int payment_id PK
        int loan_id FK
        int account_id FK
        string payment_type
        decimal amount
        date payment_date
        time payment_time
        string payment_status
    }
    Beneficiary {
        int beneficiary_id PK
        int customer_id FK
        string beneficiary_name
        string bank_name
        string branch_name
        string account_number
        string IFSC_code
        string nick_name
        timestamp added_date
    }
    Notification {
        int notification_id PK
        int customer_id FK
        string message
        timestamp notification_time
        string type
        string status
    }
    Isolation_Level {
        int level_id PK
        string level_name
        string description
    }
    Concurrency_Anomaly {
        int anomaly_id PK
        string anomaly_type
        string description
        timestamp detected_at
    }
```

## Key Entities
- **Customer & Account:** Separated to allow a single customer to own multiple accounts (Savings, Current) at different branches.
- **Card:** Linked to an Account rather than a Customer, representing debit/credit cards that share the account's balance but maintain specific daily limits.
- **Transactions & Payments:** Separated out to distinguish between generic user withdrawals and automated systemic EMI loan deductions.
