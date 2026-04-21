# Entity-Relationship (ER) Architecture

The Enterprise Banking DBMS uses a fully normalized schema designed to maintain referential integrity and support highly concurrent scaling.

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
    }
    Branch {
        int branch_id PK
        string branch_name
        string ifsc_code
    }
    Account {
        int account_id PK
        int customer_id FK
        int branch_id FK
        decimal balance
    }
    Transaction {
        int transaction_id PK
        int account_id FK
        decimal amount
    }
    ATM {
        int atm_id PK
        int branch_id FK
        decimal cash_available
    }
    Card {
        int card_id PK
        int account_id FK
        string card_number
    }
    Loan {
        int loan_id PK
        int customer_id FK
        decimal loan_amount
    }
    Payment {
        int payment_id PK
        int loan_id FK
        int account_id FK
        decimal amount
    }
```

## Key Entities
- **Customer & Account:** Separated to allow a single customer to own multiple accounts (Savings, Current) at different branches.
- **Card:** Linked to an Account rather than a Customer, representing debit/credit cards that share the account's balance but maintain specific daily limits.
- **Transactions & Payments:** Separated out to distinguish between generic user withdrawals and automated systemic EMI loan deductions.
