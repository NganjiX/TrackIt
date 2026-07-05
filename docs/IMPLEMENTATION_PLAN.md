# FinTrack — Phase 1 Implementation Plan

> **Source of truth:** FinTrack SRS v1.0 (July 2026)  
> **Architecture:** React 18 + Vite + NestJS 10 + PostgreSQL 16 + Prisma

---

## 1. Executive Summary

FinTrack is a bilingual (English / Kinyarwanda) fintech platform for Rwandan MSMEs. Release 1.0 delivers 14 use cases across 15 functional modules, a server-computed health score engine, Digital Business Passport with public share links, and an LLM-grounded AI Assistant.

This plan breaks delivery into **12 phases**, each ending with an SRS traceability checklist.

---

## 2. Requirement Inventory

### 2.1 Functional Requirements (67 total)

| Module | IDs | Count |
|--------|-----|-------|
| Authentication & Onboarding | AUTH-01 … AUTH-07 | 7 |
| Dashboard | DASH-01 … DASH-05 | 5 |
| Transactions | TXN-01 … TXN-04 | 4 |
| Customers | CUST-01 … CUST-04 | 4 |
| Suppliers | SUPP-01 … SUPP-04 | 4 |
| Debt Management | DEBT-01 … DEBT-05 | 5 |
| Documents | DOC-01 … DOC-04 | 4 |
| Inventory | INV-01 … INV-04 | 4 |
| Analytics | ANLY-01 … ANLY-05 | 5 |
| Business History | HIST-01 … HIST-04 | 4 |
| Digital Business Passport | PASS-01 … PASS-05 | 5 |
| AI Assistant | AI-01 … AI-05 | 5 |
| Settings | SET-01 … SET-03 | 3 |
| Internationalization | I18N-01 … I18N-03 | 3 |
| Navigation | NAV-01 … NAV-02 | 2 |
| **Administration** (UC-14) | Implied | 1 use case |

### 2.2 Non-Functional Requirements

| Category | Key mandates |
|----------|--------------|
| Security | HTTPS, bcrypt/argon2, JWT + httpOnly refresh cookies, row-level ownership, RBAC, file MIME validation |
| Performance | P95 < 500ms list/detail; Dashboard < 2s on 3G; indexed analytics queries |
| Availability | 99.5% uptime; daily backups (30-day PITR); `/api/v1/health` probe |
| Usability | Responsive 360px+; WCAG 2.1 AA; no hard-coded strings |
| Scalability | Stateless API; read-replica ready |
| Maintainability | NestJS modular structure; ≥70% backend test coverage |
| Localization | EN + KIN parity enforced in CI |

### 2.3 Use Cases → Modules Mapping

| UC | Use Case | Backend Module(s) | Frontend Page(s) |
|----|----------|-------------------|------------------|
| UC-01 | Register & Verify | auth, mail | Register, OTP Verification, Login |
| UC-02 | Onboarding Wizard | businesses | Onboarding (3 steps) |
| UC-03 | Record Transaction | transactions, health-score | Transactions |
| UC-04 | Manage Customer/Supplier | customers, suppliers | Customers, Suppliers |
| UC-05 | Track Debt | debts, health-score | Debt Management |
| UC-06 | Upload Document | documents, health-score | Documents |
| UC-07 | Manage Inventory | inventory, notifications | Inventory |
| UC-08 | View Analytics | analytics | Analytics |
| UC-09 | Business History | history | Business History |
| UC-10 | Digital Business Passport | passport, health-score | Passport, Public Passport |
| UC-11 | AI Assistant | ai-assistant | AI Assistant |
| UC-12 | Manage Settings | businesses, users, settings | Settings, Profile |
| UC-13 | Switch Language | — (frontend i18n) | Language toggle (global) |
| UC-14 | Administer Users | users, businesses (admin) | Admin Panel |

---

## 3. Phased Delivery Plan

### Phase 1 — Planning & Design ✅ (this document)
- SRS analysis and traceability matrix
- Folder structures
- Prisma schema
- API architecture
- Database ER diagram

### Phase 2 — Backend Foundation
- NestJS project scaffold (`backend/`)
- Config module, Prisma module, common guards/filters/pipes/interceptors
- Helmet, CORS, rate limiting, structured logging
- Docker Compose (PostgreSQL, Redis, MinIO)
- Swagger setup at `/api/docs`
- Health check endpoint
- Initial migration + seed script
- GitHub Actions: lint + test skeleton

### Phase 3 — Authentication & Authorization
- AUTH-01 … AUTH-07
- JWT access + refresh token rotation (httpOnly cookies)
- Email OTP verification (6-digit, BullMQ + Redis)
- Password reset flow
- Google OAuth 2.0 (Passport)
- RBAC (`RolesGuard`) + `BusinessOwnershipGuard`
- User profile endpoints

### Phase 4 — Frontend Foundation
- Vite + React 18 + TypeScript scaffold
- Tailwind + shadcn/ui theming (Navy `#1A2642`, Gold `#D4A017`)
- Inter + Playfair Display fonts
- React Router v6 with protected routes
- Zustand (auth, UI state) + TanStack Query
- i18next (en.json, rw.json) with language persistence
- API client with token refresh interceptor
- App shell: collapsible sidebar, mobile hamburger, breadcrumbs
- Dark mode, toast notifications, loading skeletons, error/empty states
- Auth pages: Login, Register, Forgot/Reset Password, OTP, Google callback

### Phase 5 — Onboarding & Dashboard
- AUTH-06: 3-step onboarding wizard (client draft → server persist on step 3)
- DASH-01 … DASH-05
- Dashboard module (backend aggregation queries)
- Health Score Widget + Credit Readiness Banner components
- Quick Actions

### Phase 6 — Transactions & Core Entities
- TXN-01 … TXN-04
- CUST-01 … CUST-04
- SUPP-01 … SUPP-04
- Computed balance fields (cached on write)
- Pagination, search, filters on all list endpoints

### Phase 7 — Debt Management
- DEBT-01 … DEBT-05
- Payment recording with status state machine (pending → partial → paid)
- BullMQ cron job: mark overdue debts daily
- Summary cards API

### Phase 8 — Documents & Inventory
- DOC-01 … DOC-04
- INV-01 … INV-04
- S3 presigned upload/download URLs (MinIO locally)
- File validation (image/PDF, size limits)
- In-app preview dialog (image + PDF)
- Low-stock banner logic

### Phase 9 — Analytics & Business History
- ANLY-01 … ANLY-05
- HIST-01 … HIST-04
- Monthly aggregation queries with indexes
- Recharts: area, pie, bar, line charts
- Auto-generated plain-language insights

### Phase 10 — Health Score & Digital Business Passport
- Health score engine (Section 9 algorithm)
- PASS-01 … PASS-05
- Passport ID generation (`SL-XXXXXXXX`)
- Improvement checklist (server-computed)
- PDF export (pdfkit or puppeteer)
- Public share link with expiring token

### Phase 11 — AI Assistant
- AI-01 … AI-05
- Business context aggregation service
- Claude/OpenAI gateway with system prompt grounding
- Chat history persistence
- Suggested starter questions (i18n)
- Language-aware responses

### Phase 12 — Settings, Admin & Production Hardening
- SET-01 … SET-03
- UC-14 Admin Panel (list users/businesses, admin actions)
- Notification entity (read-only UI for Release 1.0)
- CI/CD full pipeline (lint → test → build → migrate → deploy)
- Translation completeness CI check
- ≥70% backend unit test coverage
- Final SRS traceability audit

---

## 4. Health Score Algorithm (Server-Side)

> Computed exclusively in `health-score` module. Never accepted from client.

### 4.1 Sub-Metrics (weighted composite → 0–100)

| Sub-Metric | Weight | Calculation |
|------------|--------|-------------|
| **Records** | 40% | `min(100, (txnCount × 3) + (docCount × 5))` — rewards transaction + document volume |
| **Consistency** | 35% | `(activeMonths / totalMonthsSinceFirstRecord) × 100` — a month is "active" if ≥1 transaction recorded |
| **Debt Management** | 25% | `(paidDebts / totalDebts) × 100` — if no debts, score 50 (neutral) |

**Final score** = `round(records × 0.40 + consistency × 0.35 + debtManagement × 0.25)`

### 4.2 Credit Readiness Levels

| Level | Range | Label |
|-------|-------|-------|
| Low | 0–34 | Building Foundation |
| Medium | 35–69 | Near Ready |
| High | 70–100 | Credit Ready |

### 4.3 Improvement Checklist (PASS-04)

Each item is a boolean computed server-side:

1. `transactionCount >= 10`
2. `documentCount >= 3`
3. `customerCount >= 3`
4. `resolvedDebtRatio >= 0.50` (paid debts / total debts)
5. `transactionCount >= 20` (sustained activity)

### 4.4 Recalculation Triggers

Health score recomputed on create/update/delete of:
- Transaction
- Document
- Customer
- Debt (including payments)
- Business profile update

---

## 5. Cross-Cutting Concerns

### 5.1 Security Stack
- Helmet, CORS whitelist, `@nestjs/throttler` rate limiting
- Global `ValidationPipe` (whitelist + transform)
- `JwtAuthGuard` on all routes except auth + public passport
- `BusinessOwnershipGuard` on all business-scoped resources
- `RolesGuard` for admin endpoints
- bcrypt password hashing (12 rounds)
- Refresh tokens stored hashed in DB, rotated on use

### 5.2 Background Jobs (BullMQ + Redis)
- OTP email delivery
- Password reset email
- Overdue debt status update (daily cron)
- Health score recalculation (async on high-volume writes)

### 5.3 File Storage
- S3-compatible (AWS S3 prod, MinIO dev)
- Presigned PUT for upload, presigned GET for preview
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max size: 10 MB

### 5.4 AI Grounding Context
Before each LLM call, aggregate:
- Business profile + health score + credit readiness
- Last 90 days revenue/expenses/profit
- Top 5 customers by purchases
- Active debts summary
- Inventory low-stock items
- Document count by category
- Improvement checklist status

System prompt enforces: answer ONLY from provided context; respond in user's language.

---

## 6. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma | Type-safe, migration ergonomics, NestJS integration |
| State (client) | Zustand | Lightweight session/UI state per SRS |
| Server state | TanStack Query | Caching, retries, sync |
| Forms | React Hook Form + Zod | Mirrors backend DTOs |
| Email | Nodemailer + SES/SMTP | OTP + reset links |
| PDF export | PDFKit | Server-side Passport PDF generation |
| Testing | Jest + Supertest (BE), Vitest (FE) | Standard ecosystem |

---

## 7. Out of Scope (Release 1.0 — Section 11)

- Offline mode
- Credit bureau integration
- Direct loan submission
- Multi-user teams
- USSD/SMS interface
- OCR receipt scanning
- Live FX rates
- Full notification delivery system (entity exists; UI read-only)

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Health score formula not fully specified in SRS | Document proposed formula; confirm with product owner before Phase 10 |
| Kinyarwanda translation completeness | CI script comparing en.json ↔ rw.json key parity |
| LLM cost/latency | Rate limit AI endpoint; cache common starter responses |
| S3 upload failures | Two-step upload (presign → register) with cleanup job |

---

## 9. Approval Checklist (Phase 1)

Before proceeding to Phase 2, please confirm:

- [ ] Phased delivery order is acceptable
- [ ] Proposed health score formula aligns with business intent
- [ ] Prisma schema covers all SRS entities + auth support tables
- [ ] API surface is complete for Release 1.0
- [ ] Folder structure matches team conventions
- [ ] Admin Panel scope (UC-14) is approved for Phase 12

**→ Reply with approval or requested changes to proceed to Phase 2.**
