# SmartLedger — SRS Traceability Matrix

> Maps every SRS requirement to implementation phase, backend module, frontend page, and API endpoint.

---

## Phase 1 Checklist (Planning)

| Deliverable | Status |
|-------------|--------|
| SRS fully read and analyzed | ✅ |
| Implementation plan (12 phases) | ✅ |
| Folder structure documented | ✅ |
| Prisma schema (all entities + auth) | ✅ |
| API architecture (all endpoints) | ✅ |
| Database ER diagram | ✅ |
| Health score algorithm documented | ✅ |
| Traceability matrix | ✅ |

---

## Functional Requirements Traceability

### AUTH — Authentication & Onboarding

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| AUTH-01 | Email + password registration | 3 | auth | RegisterPage | POST `/auth/register` |
| AUTH-02 | Google OAuth login/register | 3 | auth | LoginPage, GoogleCallbackPage | GET `/auth/google` |
| AUTH-03 | 6-digit OTP email verification | 3 | auth, mail | OtpVerificationPage | POST `/auth/verify-otp` |
| AUTH-04 | Password recovery via email link | 3 | auth, mail | ForgotPasswordPage, ResetPasswordPage | POST `/auth/forgot-password`, `/auth/reset-password` |
| AUTH-05 | JWT access + refresh tokens | 3 | auth | — (cookie handling) | POST `/auth/login`, `/auth/refresh` |
| AUTH-06 | 3-step onboarding wizard | 5 | businesses | OnboardingPage (3 steps) | POST `/businesses/onboarding` |
| AUTH-07 | Redirect unauthenticated to Login | 4 | — | protected.routes.tsx | — |

### DASH — Dashboard

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| DASH-01 | Financial summary cards | 5 | dashboard | FinancialSummaryCards | GET `/dashboard/summary` |
| DASH-02 | Credit Readiness Banner | 5 | dashboard, health-score | CreditReadinessBanner | GET `/dashboard/summary` |
| DASH-03 | Health Score Widget (sub-metrics) | 5 | health-score | HealthScoreWidget | GET `/dashboard/summary` |
| DASH-04 | 8 most recent transactions | 5 | dashboard | RecentTransactions | GET `/dashboard/summary` |
| DASH-05 | Quick Action shortcuts | 5 | — | QuickActions | — |

### TXN — Transactions

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| TXN-01 | Create sale/expense/purchase | 6 | transactions | TransactionForm | POST `/transactions` |
| TXN-02 | Optional customer/supplier ref | 6 | transactions | TransactionForm | POST `/transactions` |
| TXN-03 | Filter by type | 6 | transactions | TransactionsPage | GET `/transactions?type=` |
| TXN-04 | Search by description/category/product | 6 | transactions | TransactionsPage | GET `/transactions?search=` |

### CUST — Customers

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| CUST-01 | Create customer | 6 | customers | CustomerForm | POST `/customers` |
| CUST-02 | Auto-compute purchases + debt balance | 6 | customers | CustomersPage | GET `/customers` |
| CUST-03 | Visual debt badge | 6 | — | DebtBadge | — |
| CUST-04 | Search by name | 6 | customers | CustomersPage | GET `/customers?search=` |

### SUPP — Suppliers

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| SUPP-01 | Create supplier | 6 | suppliers | SupplierForm | POST `/suppliers` |
| SUPP-02 | Auto-compute payments + balance | 6 | suppliers | SuppliersPage | GET `/suppliers` |
| SUPP-03 | Owed badge | 6 | — | DebtBadge | — |
| SUPP-04 | Search by name | 6 | suppliers | SuppliersPage | GET `/suppliers?search=` |

### DEBT — Debt Management

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| DEBT-01 | Record receivable/payable | 7 | debts | DebtForm | POST `/debts` |
| DEBT-02 | Partial/full payments + status transition | 7 | debts | DebtsPage | POST `/debts/:id/payments` |
| DEBT-03 | Summary cards | 7 | debts | DebtsPage | GET `/debts/summary` |
| DEBT-04 | Auto-mark overdue | 7 | debts (BullMQ cron) | DebtsPage | — |
| DEBT-05 | Filter All/Receivable/Payable | 7 | debts | DebtsPage | GET `/debts?type=` |

### DOC — Documents

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| DOC-01 | Upload image/PDF by category | 8 | documents, storage | DocumentUploadForm | POST `/documents/upload-url` |
| DOC-02 | Store name, category, date, amount, notes | 8 | documents | DocumentsPage | POST `/documents` |
| DOC-03 | Filter + search | 8 | documents | DocumentsPage | GET `/documents` |
| DOC-04 | In-app preview dialog | 8 | documents, storage | DocumentsPage | GET `/documents/:id/preview-url` |

### INV — Inventory

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| INV-01 | Add product with all fields | 8 | inventory | ProductForm | POST `/inventory/products` |
| INV-02 | Sortable product table | 8 | inventory | InventoryPage | GET `/inventory/products` |
| INV-03 | Low-stock warning banner | 8 | inventory | LowStockBanner | GET `/inventory/products/low-stock` |
| INV-04 | Search by name | 8 | inventory | InventoryPage | GET `/inventory/products?search=` |

### ANLY — Analytics

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| ANLY-01 | Revenue/expense/profit for period | 9 | analytics | AnalyticsPage | GET `/analytics/summary` |
| ANLY-02 | Revenue vs Expenses area chart | 9 | analytics | RevenueExpenseChart | GET `/analytics/summary` |
| ANLY-03 | Expense Breakdown pie chart | 9 | analytics | ExpenseBreakdownChart | GET `/analytics/summary` |
| ANLY-04 | Profit Trend bar chart | 9 | analytics | ProfitTrendChart | GET `/analytics/summary` |
| ANLY-05 | Auto-generated insights | 9 | analytics | AnalyticsPage | GET `/analytics/summary` |

### HIST — Business History

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| HIST-01 | 5-year summary | 9 | history | HistoryPage | GET `/history/five-year` |
| HIST-02 | Yearly trend line chart | 9 | history | YearlyTrendChart | GET `/history/five-year` |
| HIST-03 | YoY growth rates | 9 | history | HistoryPage | GET `/history/five-year` |
| HIST-04 | Annual breakdown + milestones | 9 | history | HistoryPage | GET `/history/five-year` |

### PASS — Digital Business Passport

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| PASS-01 | Unique Passport ID (SL-XXXXXXXX) | 10 | passport, businesses | PassportPage | GET `/passport` |
| PASS-02 | Business info + health score on Passport | 10 | passport | PassportCard | GET `/passport` |
| PASS-03 | Activity summary | 10 | passport | PassportPage | GET `/passport` |
| PASS-04 | Improvement checklist | 10 | health-score, passport | ImprovementChecklist | GET `/passport` |
| PASS-05 | Export PDF + share link | 10 | passport | SharePassportDialog, PublicPassportPage | POST `/passport/share-link`, GET `/passport/public/:token` |

### AI — AI Assistant

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| AI-01 | Chat interface | 11 | ai-assistant | AssistantPage, ChatWindow | POST `/ai-assistant/chat` |
| AI-02 | Grounded with business data | 11 | ai-assistant, business-context | — | POST `/ai-assistant/chat` |
| AI-03 | Suggested starter questions | 11 | ai-assistant | StarterQuestions | GET `/ai-assistant/suggestions` |
| AI-04 | Respond in user's language | 11 | ai-assistant | — | POST `/ai-assistant/chat` |
| AI-05 | No cross-business data access | 11 | business-ownership guard | — | — |

### SET — Settings

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| SET-01 | View profile (email, name, role) | 12 | settings, users | ProfilePage | GET `/settings/profile` |
| SET-02 | Edit business details | 12 | businesses | SettingsPage | PATCH `/businesses/me` |
| SET-03 | Health score in Settings | 12 | settings | SettingsPage | GET `/settings/health` |

### I18N — Internationalization

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| I18N-01 | Complete EN + KIN translations | 4+ (all) | error codes | en.json, rw.json | — |
| I18N-02 | Language toggle on sidebar + auth | 4 | — | LanguageToggle | — |
| I18N-03 | Persist language preference | 4 | users | ui.store + i18n | PATCH `/settings/language` |

### NAV — Navigation

| Req ID | Requirement | Phase | Backend | Frontend | API |
|--------|-------------|-------|---------|----------|-----|
| NAV-01 | Collapsible sidebar (12 items) | 4 | — | Sidebar | — |
| NAV-02 | Hamburger overlay on mobile | 4 | — | MobileNav | — |

### UC-14 — Administration

| Use Case | Requirement | Phase | Backend | Frontend | API |
|----------|-------------|-------|---------|----------|-----|
| UC-14 | Administer users & businesses | 12 | admin | AdminPanelPage | GET `/admin/users`, `/admin/businesses` |

---

## Non-Functional Requirements Traceability

| NFR | Requirement | Phase | Implementation |
|-----|-------------|-------|----------------|
| 6.1 Security | HTTPS/TLS | 12 | Production deployment config |
| 6.1 Security | bcrypt password hashing | 3 | auth.service.ts |
| 6.1 Security | JWT + httpOnly refresh cookies | 3 | auth module |
| 6.1 Security | Row-level ownership | 3 | BusinessOwnershipGuard |
| 6.1 Security | RBAC admin guard | 3, 12 | RolesGuard |
| 6.1 Security | File MIME validation | 8 | documents.service.ts |
| 6.1 Security | Server-side health score | 10 | health-score.service.ts |
| 6.2 Performance | P95 < 500ms | 2+ | Indexes, caching |
| 6.2 Performance | Dashboard < 2s | 5 | Aggregated queries |
| 6.3 Availability | 99.5% uptime | 12 | Health checks, monitoring |
| 6.3 Availability | Daily backups | 12 | RDS/managed PostgreSQL |
| 6.3 Availability | /health endpoint | 2 | health.controller.ts |
| 6.4 Usability | Responsive 360px+ | 4+ | Tailwind responsive classes |
| 6.4 Usability | WCAG 2.1 AA | 4+ | Color contrast tokens |
| 6.4 Usability | No hard-coded strings | 4+ | i18n files |
| 6.5 Scalability | Stateless API | 2 | JWT auth |
| 6.6 Maintainability | Modular NestJS | 2+ | Module per bounded context |
| 6.6 Maintainability | ≥70% test coverage | 12 | Jest unit tests |
| 6.7 Localization | CI translation check | 12 | i18n-check.yml workflow |

---

## Remaining Requirements (Post Phase 1)

All 67 functional requirements + NFRs remain **pending implementation**. Phase 1 deliverables are design artifacts only.

| Category | Total | Phase 1 Complete | Remaining |
|----------|-------|------------------|-----------|
| Functional (AUTH–NAV) | 67 | 0 implemented | 67 |
| Use Cases (UC-01–14) | 14 | 0 implemented | 14 |
| NFR categories | 7 | 0 implemented | 7 |
| Frontend pages | 20 | 0 implemented | 20 |
| Backend modules | 18 | 0 implemented | 18 |
| API endpoints | ~55 | 0 implemented | ~55 |

---

## Approval Required

Phase 1 is complete. Please review and approve before Phase 2 (Backend Foundation) begins.

**Key decisions needing confirmation:**
1. Health score formula (proposed in IMPLEMENTATION_PLAN.md Section 4)
2. Additional auth/support tables beyond SRS Section 5 (RefreshToken, OtpVerification, etc.)
3. Admin module scope for UC-14
4. AI provider preference (Claude vs OpenAI)
