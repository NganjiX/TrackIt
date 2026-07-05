# SmartLedger — API Architecture

> Base URL: `/api/v1`  
> Content-Type: `application/json`  
> Auth: `Authorization: Bearer <access_token>` (except public routes)

---

## 1. Architecture Overview

```
┌─────────────┐     HTTPS/JSON      ┌──────────────────────────────────────┐
│  React SPA  │ ◄──────────────────►│  NestJS Modular Monolith             │
│  TanStack   │                     │  Guards → Pipes → Controllers        │
│  Query      │                     │  Services → Prisma → PostgreSQL      │
└─────────────┘                     └──────────┬───────────────┬───────────┘
                                               │               │
                                    ┌──────────▼──┐   ┌────────▼────────┐
                                    │ Redis/BullMQ│   │ S3 / MinIO      │
                                    └─────────────┘   └─────────────────┘
                                               │
                                    ┌──────────▼──────────────────────────┐
                                    │ External: Google OAuth, SMTP, LLM   │
                                    └─────────────────────────────────────┘
```

### Request Lifecycle

1. **Helmet** + **CORS** + **Rate Limiter** (global)
2. **JwtAuthGuard** — validates access token (skip on `@Public()`)
3. **RolesGuard** — checks `@Roles('admin')` if present
4. **BusinessOwnershipGuard** — verifies resource belongs to user's business
5. **ValidationPipe** — class-validator DTO validation
6. **Controller** → **Service** → **Prisma**
7. **HttpExceptionFilter** — consistent error shape
8. **TransformInterceptor** — wraps success responses

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

### Standard Pagination Query

```
?page=1&limit=20&search=keyword&sortBy=createdAt&sortOrder=desc
```

### Standard Paginated Response

```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 2. Authentication Endpoints

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| POST | `/auth/register` | Public | Register email/password, send OTP | AUTH-01, AUTH-03 |
| POST | `/auth/verify-otp` | Public | Verify 6-digit OTP | AUTH-03 |
| POST | `/auth/resend-otp` | Public | Resend OTP code | AUTH-03 |
| POST | `/auth/login` | Public | Login → access + refresh tokens | AUTH-05 |
| POST | `/auth/refresh` | Cookie | Rotate refresh token | AUTH-05 |
| POST | `/auth/logout` | JWT | Revoke refresh token | AUTH-05 |
| GET | `/auth/google` | Public | Initiate Google OAuth | AUTH-02 |
| GET | `/auth/google/callback` | Public | Google OAuth callback | AUTH-02 |
| POST | `/auth/forgot-password` | Public | Send reset link email | AUTH-04 |
| POST | `/auth/reset-password` | Public | Reset password via token | AUTH-04 |
| GET | `/auth/me` | JWT | Current user profile | SET-01 |

### POST `/auth/register`

**Request:**
```json
{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "fullName": "Jean Bizimungu"
}
```

**Response:** `201 Created`
```json
{
  "message": "OTP sent to email",
  "userId": "uuid"
}
```

### POST `/auth/login`

**Response:** `200 OK` + httpOnly refresh cookie
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "owner@example.com",
    "fullName": "Jean Bizimungu",
    "role": "user",
    "emailVerified": true
  }
}
```

---

## 3. Business & Onboarding

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| POST | `/businesses/onboarding` | JWT | Complete 3-step onboarding | AUTH-06 |
| GET | `/businesses/me` | JWT | Current business + health score | SET-03 |
| PATCH | `/businesses/me` | JWT | Update business settings | SET-02 |

### POST `/businesses/onboarding`

**Request:**
```json
{
  "name": "Kigali Fresh Market",
  "type": "retail_shop",
  "industry": "Grocery",
  "location": "Kigali, Gasabo",
  "yearsOperating": 3,
  "numEmployees": 5,
  "goals": "Expand to second location and apply for MFI loan"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "passportId": "SL-A1B2C3D4",
  "name": "Kigali Fresh Market",
  "onboardingComplete": true,
  "healthScore": 0,
  "creditReadiness": "low"
}
```

---

## 4. Dashboard

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/dashboard/summary` | JWT | Financial summary + health + recent txns | DASH-01..05 |

**Response:**
```json
{
  "financials": {
    "totalRevenue": 15000000,
    "totalExpenses": 8500000,
    "estimatedProfit": 6500000,
    "outstandingDebts": 1200000,
    "currency": "RWF"
  },
  "creditReadiness": {
    "level": "medium",
    "label": "Near Ready",
    "healthScore": 52,
    "progressPercent": 52
  },
  "healthScoreBreakdown": {
    "overall": 52,
    "records": 60,
    "consistency": 45,
    "debtManagement": 50
  },
  "recentTransactions": [],
  "quickActions": ["record_sale", "upload_receipt", "view_passport", "track_debt"]
}
```

---

## 5. Transactions

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/transactions` | JWT | List with filter/search/pagination | TXN-03, TXN-04 |
| GET | `/transactions/:id` | JWT | Get single transaction | — |
| POST | `/transactions` | JWT | Create transaction | TXN-01, TXN-02 |
| PATCH | `/transactions/:id` | JWT | Update transaction | — |
| DELETE | `/transactions/:id` | JWT | Delete transaction | — |

**Query params:** `type`, `search`, `page`, `limit`, `dateFrom`, `dateTo`

**POST Request:**
```json
{
  "type": "sale",
  "category": "Produce",
  "amount": 25000,
  "description": "Tomatoes sale",
  "date": "2026-07-05",
  "paymentStatus": "paid",
  "productService": "Tomatoes",
  "customerId": "uuid-or-null"
}
```

---

## 6. Customers

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/customers` | JWT | List with search/pagination | CUST-04 |
| GET | `/customers/:id` | JWT | Detail with computed balances | CUST-02 |
| POST | `/customers` | JWT | Create customer | CUST-01 |
| PATCH | `/customers/:id` | JWT | Update customer | — |
| DELETE | `/customers/:id` | JWT | Delete customer | — |

---

## 7. Suppliers

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/suppliers` | JWT | List with search/pagination | SUPP-04 |
| GET | `/suppliers/:id` | JWT | Detail with computed balances | SUPP-02 |
| POST | `/suppliers` | JWT | Create supplier | SUPP-01 |
| PATCH | `/suppliers/:id` | JWT | Update supplier | — |
| DELETE | `/suppliers/:id` | JWT | Delete supplier | — |

---

## 8. Debts

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/debts` | JWT | List with filter/pagination | DEBT-05 |
| GET | `/debts/summary` | JWT | Summary cards | DEBT-03 |
| GET | `/debts/:id` | JWT | Debt detail + payments | — |
| POST | `/debts` | JWT | Create receivable/payable | DEBT-01 |
| POST | `/debts/:id/payments` | JWT | Record payment | DEBT-02 |
| PATCH | `/debts/:id` | JWT | Update debt | — |
| DELETE | `/debts/:id` | JWT | Delete debt | — |

**GET `/debts/summary` Response:**
```json
{
  "totalReceivable": 500000,
  "totalPayable": 300000,
  "overdueCount": 2,
  "currency": "RWF"
}
```

**POST `/debts/:id/payments` Request:**
```json
{
  "amount": 100000,
  "note": "Partial payment via mobile money"
}
```

---

## 9. Documents

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| POST | `/documents/upload-url` | JWT | Get presigned S3 upload URL | DOC-01 |
| GET | `/documents` | JWT | List with filter/search | DOC-03 |
| GET | `/documents/:id` | JWT | Document detail | — |
| GET | `/documents/:id/preview-url` | JWT | Presigned preview URL | DOC-04 |
| POST | `/documents` | JWT | Register uploaded document | DOC-02 |
| DELETE | `/documents/:id` | JWT | Delete document | — |

**POST `/documents/upload-url` Request:**
```json
{
  "fileName": "receipt-july.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 245000
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.../presigned",
  "fileKey": "businesses/uuid/documents/uuid.jpg",
  "expiresIn": 300
}
```

---

## 10. Inventory

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/inventory/products` | JWT | List products (sortable) | INV-02, INV-04 |
| GET | `/inventory/products/low-stock` | JWT | Low-stock products | INV-03 |
| GET | `/inventory/products/:id` | JWT | Product detail | — |
| POST | `/inventory/products` | JWT | Create product | INV-01 |
| PATCH | `/inventory/products/:id` | JWT | Update product | — |
| DELETE | `/inventory/products/:id` | JWT | Delete product | — |

---

## 11. Analytics

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/analytics/summary` | JWT | Summary + charts + insights | ANLY-01..05 |

**Query params:** `period=month|quarter|year|custom`, `dateFrom`, `dateTo`

**Response:**
```json
{
  "summary": {
    "totalRevenue": 15000000,
    "totalExpenses": 8500000,
    "netProfit": 6500000,
    "currency": "RWF"
  },
  "revenueVsExpenses": [
    { "month": "2026-01", "revenue": 1200000, "expenses": 800000 }
  ],
  "expenseBreakdown": [
    { "category": "Rent", "amount": 500000, "percent": 35 }
  ],
  "profitTrend": [
    { "month": "2026-01", "profit": 400000 }
  ],
  "insights": {
    "revenueTrend": "Revenue increased 12% compared to last period",
    "topExpenseCategory": "Rent accounts for 35% of expenses",
    "profitMargin": "Your profit margin is 43.3%"
  }
}
```

---

## 12. Business History

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/history/five-year` | JWT | 5-year rollup + YoY + milestones | HIST-01..04 |

**Response:**
```json
{
  "summary": {
    "totalRevenue": 75000000,
    "totalExpenses": 45000000,
    "averageAnnualProfit": 6000000,
    "transactionCount": 1250
  },
  "yearlyTrend": [
    { "year": 2022, "revenue": 10000000, "profit": 3000000 }
  ],
  "yearOverYearGrowth": {
    "revenue": 15.2,
    "profit": 22.5
  },
  "annualBreakdown": [],
  "milestones": {
    "foundingYear": 2020,
    "bestPerformingYear": 2025,
    "totalTransactionVolume": 1250
  }
}
```

---

## 13. Digital Business Passport

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/passport` | JWT | Full passport payload | PASS-01..04 |
| POST | `/passport/share-link` | JWT | Generate shareable link | PASS-05 |
| GET | `/passport/export/pdf` | JWT | Download PDF | PASS-05 |
| GET | `/passport/public/:token` | **Public** | Lender read-only view | PASS-05 |

**GET `/passport` Response:**
```json
{
  "passportId": "SL-A1B2C3D4",
  "business": {
    "name": "Kigali Fresh Market",
    "type": "retail_shop",
    "location": "Kigali, Gasabo",
    "yearsOperating": 3,
    "numEmployees": 5
  },
  "healthScore": 52,
  "creditReadiness": { "level": "medium", "label": "Near Ready" },
  "activitySummary": {
    "transactionsRecorded": 45,
    "documentsUploaded": 8,
    "customersRegistered": 12,
    "debtsResolved": 5
  },
  "improvementChecklist": [
    { "id": "transactions_10", "label": "Record at least 10 transactions", "completed": true },
    { "id": "documents_3", "label": "Upload at least 3 documents", "completed": true },
    { "id": "customers_3", "label": "Add at least 3 customers", "completed": true },
    { "id": "debts_50pct", "label": "Resolve at least 50% of debts", "completed": false },
    { "id": "transactions_20", "label": "Keep recording (20+ transactions)", "completed": false }
  ]
}
```

---

## 14. AI Assistant

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| POST | `/ai-assistant/chat` | JWT | Send message, get grounded reply | AI-01, AI-02, AI-04 |
| GET | `/ai-assistant/suggestions` | JWT | Starter questions (i18n) | AI-03 |
| GET | `/ai-assistant/sessions` | JWT | Chat history sessions | — |
| GET | `/ai-assistant/sessions/:id/messages` | JWT | Session messages | — |

**POST `/ai-assistant/chat` Request:**
```json
{
  "message": "Am I ready for a loan?",
  "sessionId": "uuid-or-null",
  "language": "en"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "reply": "Based on your current health score of 52...",
  "language": "en"
}
```

---

## 15. Settings & Users

| Method | Path | Auth | Description | SRS |
|--------|------|------|-------------|-----|
| GET | `/settings/profile` | JWT | User profile | SET-01 |
| PATCH | `/settings/profile` | JWT | Update name | SET-01 |
| PATCH | `/settings/language` | JWT | Update language preference | I18N-03 |
| GET | `/settings/health` | JWT | Health score in settings | SET-03 |

---

## 16. Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | JWT | List notifications |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| PATCH | `/notifications/read-all` | JWT | Mark all read |

---

## 17. Admin (UC-14)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/users/:id` | Admin | User detail |
| PATCH | `/admin/users/:id/role` | Admin | Update user role |
| GET | `/admin/businesses` | Admin | List all businesses |
| GET | `/admin/businesses/:id` | Admin | Business detail |
| GET | `/admin/stats` | Admin | Platform statistics |

---

## 18. Platform Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Liveness/readiness probe |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-05T09:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

---

## 19. Swagger Documentation

- **URL:** `/api/docs`
- All endpoints documented with request/response examples
- Bearer auth scheme configured
- Grouped by module tags

---

## 20. Module → Controller Mapping

| NestJS Module | Controller Prefix | Service Dependencies |
|---------------|-------------------|---------------------|
| AuthModule | `/auth` | Users, Mail, Prisma |
| UsersModule | `/users` | Prisma |
| BusinessesModule | `/businesses` | HealthScore, Prisma |
| DashboardModule | `/dashboard` | Transactions, Debts, HealthScore |
| TransactionsModule | `/transactions` | HealthScore, Customers, Suppliers |
| CustomersModule | `/customers` | HealthScore, Transactions |
| SuppliersModule | `/suppliers` | HealthScore, Transactions |
| DebtsModule | `/debts` | HealthScore, BullMQ |
| DocumentsModule | `/documents` | Storage, HealthScore |
| InventoryModule | `/inventory` | Notifications |
| AnalyticsModule | `/analytics` | Transactions |
| HistoryModule | `/history` | Transactions |
| PassportModule | `/passport` | HealthScore, Businesses |
| AiAssistantModule | `/ai-assistant` | BusinessContext, LLM |
| SettingsModule | `/settings` | Users, Businesses |
| NotificationsModule | `/notifications` | Prisma |
| AdminModule | `/admin` | Users, Businesses |
| HealthModule | `/health` | Prisma, Redis |
