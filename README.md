# FinTrack

Digital Ledger, Business Health Tracker & Credit Readiness Platform for Rwandan MSMEs.

**Stack:** React 18 · Vite · NestJS 10 · PostgreSQL 16 · Prisma · TypeScript

## Repository Structure

```
smartledger/
├── frontend/          # React SPA
├── backend/           # NestJS API
├── docs/              # Architecture, SRS traceability, diagrams
├── docker/            # Docker Compose & container configs
└── .github/           # CI/CD workflows
```

## Phase Status

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | SRS analysis, plan, schema, API design | ✅ Complete |
| 2 | Backend foundation | ✅ Complete |
| 3 | Authentication | ✅ Complete |
| 4 | Frontend foundation | ✅ Complete |
| 5 | Onboarding & Dashboard | ✅ Complete |
| 6 | Transactions, Customers, Suppliers | ✅ Complete |
| 7 | Debt Management | ✅ Complete |
| 8 | Documents & Inventory | ✅ Complete |
| 9 | Analytics & Business History | ✅ Complete |
| 10 | Health Score & Digital Business Passport | ✅ Complete |
| 11 | AI Assistant | ✅ Complete |
| 12 | Settings, Admin & CI hardening | ✅ Complete |

## Documentation

- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Folder Structure](./docs/FOLDER_STRUCTURE.md)
- [API Architecture](./docs/API_ARCHITECTURE.md)
- [Database Diagram](./docs/DATABASE_DIAGRAM.md)
- [SRS Traceability Matrix](./docs/SRS_TRACEABILITY.md)

## Quick Start (after Phase 2+)

```bash
# Backend
cd backend && npm install && npx prisma migrate dev && npm run start:dev

# Frontend
cd frontend && npm install && copy .env.example .env && npm run dev

# Full stack via Docker
docker compose -f docker/docker-compose.yml up
```

## License

Proprietary — FinTrack © 2026

# TrackIt
