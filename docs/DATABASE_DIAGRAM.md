# FinTrack — Database Entity Relationship Diagram

## ER Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o| Business : owns
    User ||--o{ RefreshToken : has
    User ||--o{ OtpVerification : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ Notification : receives
    User ||--o{ AiChatSession : has
    User ||--o{ Transaction : creates
    User ||--o{ Customer : creates
    User ||--o{ Supplier : creates
    User ||--o{ Debt : creates
    User ||--o{ Document : creates
    User ||--o{ Product : creates

    Business ||--o{ Transaction : has
    Business ||--o{ Customer : has
    Business ||--o{ Supplier : has
    Business ||--o{ Debt : has
    Business ||--o{ Document : has
    Business ||--o{ Product : has
    Business ||--o{ Notification : has
    Business ||--o{ PassportShare : has
    Business ||--o{ HealthScoreLog : has

    Customer ||--o{ Transaction : referenced_by
    Customer ||--o{ Debt : party_of
    Supplier ||--o{ Transaction : referenced_by
    Supplier ||--o{ Debt : party_of

    Debt ||--o{ DebtPayment : has
    AiChatSession ||--o{ AiChatMessage : contains

    User {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        enum role
        enum auth_provider
        string google_id UK
        boolean email_verified
        string language
        timestamp created_at
        timestamp updated_at
    }

    Business {
        uuid id PK
        uuid owner_id FK UK
        string passport_id UK
        string name
        enum type
        string industry
        string location
        int years_operating
        int num_employees
        text goals
        string currency
        int health_score
        enum credit_readiness
        boolean onboarding_complete
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    Transaction {
        uuid id PK
        uuid business_id FK
        enum type
        string category
        decimal amount
        text description
        date date
        uuid customer_id FK
        uuid supplier_id FK
        enum payment_status
        string product_service
        string receipt_url
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Customer {
        uuid id PK
        uuid business_id FK
        string name
        string phone
        string email
        string address
        decimal total_purchases
        decimal debt_balance
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Supplier {
        uuid id PK
        uuid business_id FK
        string name
        string phone
        string email
        string address
        decimal total_payments
        decimal outstanding_balance
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Debt {
        uuid id PK
        uuid business_id FK
        enum type
        string party_name
        uuid customer_id FK
        uuid supplier_id FK
        decimal amount
        decimal paid_amount
        date due_date
        enum status
        text description
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    DebtPayment {
        uuid id PK
        uuid debt_id FK
        decimal amount
        timestamp paid_at
        string note
        timestamp created_at
    }

    Document {
        uuid id PK
        uuid business_id FK
        string name
        enum category
        string file_url
        string file_key
        string mime_type
        int file_size
        date date
        decimal amount
        text notes
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Product {
        uuid id PK
        uuid business_id FK
        string name
        string category
        decimal price
        decimal cost
        int stock_quantity
        int low_stock_threshold
        string unit
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Notification {
        uuid id PK
        uuid business_id FK
        uuid user_id FK
        string title
        text message
        enum type
        boolean read
        string link
        timestamp created_at
        timestamp updated_at
    }

    PassportShare {
        uuid id PK
        uuid business_id FK
        string token UK
        timestamp expires_at
        boolean revoked
        timestamp created_at
    }

    HealthScoreLog {
        uuid id PK
        uuid business_id FK
        int score
        int records_score
        int consistency_score
        int debt_score
        enum credit_readiness
        timestamp created_at
    }

    AiChatSession {
        uuid id PK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }

    AiChatMessage {
        uuid id PK
        uuid session_id FK
        string role
        text content
        string language
        timestamp created_at
    }
```

---

## Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `transactions` | `(business_id, date)` | Analytics & history aggregation |
| `transactions` | `(business_id, type)` | Filter by type |
| `debts` | `(business_id, status)` | Overdue debt queries |
| `debts` | `(business_id, due_date)` | Overdue cron job |
| `customers` | `(business_id, name)` | Name search |
| `suppliers` | `(business_id, name)` | Name search |
| `products` | `(business_id, name)` | Name search |
| `documents` | `(business_id, category)` | Category filter |
| `health_score_logs` | `(business_id, created_at)` | Score history |
| `notifications` | `(business_id, user_id, read)` | Unread count |

---

## Computed / Cached Fields

These columns are **never** accepted from client input. Updated by service layer on write:

| Entity | Field | Trigger |
|--------|-------|---------|
| Customer | `total_purchases`, `debt_balance` | Transaction create/update/delete; Debt payment |
| Supplier | `total_payments`, `outstanding_balance` | Transaction create/update/delete; Debt payment |
| Business | `health_score`, `credit_readiness` | Transaction, Document, Customer, Debt writes |
| Debt | `status` | Payment recorded; daily overdue cron |

---

## Soft Delete

- `Business.deleted_at` — soft delete for audit trail integrity (SRS Section 5.10)
- Child entities use `onDelete: Restrict` to prevent accidental cascade deletion of financial records

---

## Passport ID Format

- Generated on business creation during onboarding
- Format: `SL-XXXXXXXX` (8 alphanumeric uppercase characters)
- Stored in `Business.passport_id` with unique constraint

---

## Seed Data (Development)

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 2 | 1 admin, 1 business owner |
| Businesses | 1 | Fully onboarded sample business |
| Transactions | 25 | Mix of sale/expense/purchase over 6 months |
| Customers | 5 | With varying debt balances |
| Suppliers | 3 | With outstanding balances |
| Debts | 6 | Mix receivable/payable, various statuses |
| Documents | 5 | Various categories |
| Products | 8 | 2 below low-stock threshold |
| Notifications | 3 | Sample alerts |
