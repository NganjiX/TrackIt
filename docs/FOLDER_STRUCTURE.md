# FinTrack — Folder Structure

```
smartledger/
├── README.md
├── .github/
│   └── workflows/
│       ├── backend-ci.yml          # lint → test → build → migrate
│       ├── frontend-ci.yml         # lint → test → build
│       ├── deploy-backend.yml
│       ├── deploy-frontend.yml
│       └── i18n-check.yml          # EN/KIN key parity validation
│
├── docker/
│   ├── docker-compose.yml          # postgres, redis, minio, backend, frontend
│   ├── docker-compose.prod.yml
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── FOLDER_STRUCTURE.md
│   ├── API_ARCHITECTURE.md
│   ├── DATABASE_DIAGRAM.md
│   └── SRS_TRACEABILITY.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── test/
│   │   ├── jest-e2e.json
│   │   └── app.e2e-spec.ts
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/
│       │   ├── decorators/
│       │   │   ├── current-user.decorator.ts
│       │   │   ├── roles.decorator.ts
│       │   │   └── api-paginated.decorator.ts
│       │   ├── dto/
│       │   │   ├── pagination-query.dto.ts
│       │   │   └── api-response.dto.ts
│       │   ├── enums/
│       │   ├── filters/
│       │   │   └── http-exception.filter.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   ├── roles.guard.ts
│       │   │   └── business-ownership.guard.ts
│       │   ├── interceptors/
│       │   │   ├── logging.interceptor.ts
│       │   │   └── transform.interceptor.ts
│       │   └── pipes/
│       ├── config/
│       │   ├── config.module.ts
│       │   ├── app.config.ts
│       │   ├── auth.config.ts
│       │   ├── database.config.ts
│       │   ├── mail.config.ts
│       │   ├── storage.config.ts
│       │   └── ai.config.ts
│       ├── prisma/
│       │   ├── prisma.module.ts
│       │   └── prisma.service.ts
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.service.spec.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   ├── jwt-refresh.strategy.ts
│       │   │   └── google.strategy.ts
│       │   └── dto/
│       │       ├── register.dto.ts
│       │       ├── login.dto.ts
│       │       ├── verify-otp.dto.ts
│       │       ├── forgot-password.dto.ts
│       │       └── reset-password.dto.ts
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.service.spec.ts
│       │   └── dto/
│       ├── businesses/
│       │   ├── businesses.module.ts
│       │   ├── businesses.controller.ts
│       │   ├── businesses.service.ts
│       │   └── dto/
│       │       ├── onboarding.dto.ts
│       │       └── update-business.dto.ts
│       ├── dashboard/
│       │   ├── dashboard.module.ts
│       │   ├── dashboard.controller.ts
│       │   └── dashboard.service.ts
│       ├── transactions/
│       │   ├── transactions.module.ts
│       │   ├── transactions.controller.ts
│       │   ├── transactions.service.ts
│       │   ├── transactions.service.spec.ts
│       │   └── dto/
│       ├── customers/
│       │   ├── customers.module.ts
│       │   ├── customers.controller.ts
│       │   ├── customers.service.ts
│       │   └── dto/
│       ├── suppliers/
│       │   ├── suppliers.module.ts
│       │   ├── suppliers.controller.ts
│       │   ├── suppliers.service.ts
│       │   └── dto/
│       ├── debts/
│       │   ├── debts.module.ts
│       │   ├── debts.controller.ts
│       │   ├── debts.service.ts
│       │   ├── debts.service.spec.ts
│       │   ├── debts.processor.ts          # BullMQ overdue job
│       │   └── dto/
│       ├── documents/
│       │   ├── documents.module.ts
│       │   ├── documents.controller.ts
│       │   ├── documents.service.ts
│       │   └── dto/
│       ├── inventory/
│       │   ├── inventory.module.ts
│       │   ├── inventory.controller.ts
│       │   ├── inventory.service.ts
│       │   └── dto/
│       ├── analytics/
│       │   ├── analytics.module.ts
│       │   ├── analytics.controller.ts
│       │   ├── analytics.service.ts
│       │   └── dto/
│       ├── history/
│       │   ├── history.module.ts
│       │   ├── history.controller.ts
│       │   └── history.service.ts
│       ├── passport/
│       │   ├── passport.module.ts
│       │   ├── passport.controller.ts
│       │   ├── passport.service.ts
│       │   ├── passport-pdf.service.ts
│       │   └── dto/
│       ├── health-score/
│       │   ├── health-score.module.ts
│       │   ├── health-score.service.ts
│       │   ├── health-score.service.spec.ts
│       │   └── health-score.types.ts
│       ├── ai-assistant/
│       │   ├── ai-assistant.module.ts
│       │   ├── ai-assistant.controller.ts
│       │   ├── ai-assistant.service.ts
│       │   ├── business-context.service.ts
│       │   └── dto/
│       ├── notifications/
│       │   ├── notifications.module.ts
│       │   ├── notifications.controller.ts
│       │   └── notifications.service.ts
│       ├── mail/
│       │   ├── mail.module.ts
│       │   ├── mail.service.ts
│       │   └── templates/
│       │       ├── otp.hbs
│       │       └── reset-password.hbs
│       ├── storage/
│       │   ├── storage.module.ts
│       │   └── storage.service.ts
│       ├── settings/
│       │   ├── settings.module.ts
│       │   ├── settings.controller.ts
│       │   └── settings.service.ts
│       ├── admin/
│       │   ├── admin.module.ts
│       │   ├── admin.controller.ts
│       │   └── admin.service.ts
│       └── health/
│           ├── health.module.ts
│           └── health.controller.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── components.json                 # shadcn/ui config
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── vite-env.d.ts
        ├── app/
        │   ├── router.tsx
        │   ├── providers.tsx
        │   └── routes/
        │       ├── public.routes.tsx
        │       ├── protected.routes.tsx
        │       └── admin.routes.tsx
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   ├── RegisterPage.tsx
        │   │   ├── ForgotPasswordPage.tsx
        │   │   ├── ResetPasswordPage.tsx
        │   │   ├── OtpVerificationPage.tsx
        │   │   └── GoogleCallbackPage.tsx
        │   ├── onboarding/
        │   │   ├── OnboardingPage.tsx
        │   │   ├── StepBusinessInfo.tsx
        │   │   ├── StepOperations.tsx
        │   │   └── StepGoals.tsx
        │   ├── dashboard/
        │   │   └── DashboardPage.tsx
        │   ├── transactions/
        │   │   └── TransactionsPage.tsx
        │   ├── customers/
        │   │   └── CustomersPage.tsx
        │   ├── suppliers/
        │   │   └── SuppliersPage.tsx
        │   ├── debts/
        │   │   └── DebtsPage.tsx
        │   ├── documents/
        │   │   └── DocumentsPage.tsx
        │   ├── inventory/
        │   │   └── InventoryPage.tsx
        │   ├── analytics/
        │   │   └── AnalyticsPage.tsx
        │   ├── history/
        │   │   └── HistoryPage.tsx
        │   ├── passport/
        │   │   ├── PassportPage.tsx
        │   │   └── PublicPassportPage.tsx
        │   ├── assistant/
        │   │   └── AssistantPage.tsx
        │   ├── settings/
        │   │   ├── SettingsPage.tsx
        │   │   └── ProfilePage.tsx
        │   └── admin/
        │       └── AdminPanelPage.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── MobileNav.tsx
        │   │   ├── Header.tsx
        │   │   ├── Breadcrumbs.tsx
        │   │   └── LanguageToggle.tsx
        │   ├── dashboard/
        │   │   ├── FinancialSummaryCards.tsx
        │   │   ├── CreditReadinessBanner.tsx
        │   │   ├── HealthScoreWidget.tsx
        │   │   ├── RecentTransactions.tsx
        │   │   └── QuickActions.tsx
        │   ├── charts/
        │   │   ├── RevenueExpenseChart.tsx
        │   │   ├── ExpenseBreakdownChart.tsx
        │   │   ├── ProfitTrendChart.tsx
        │   │   └── YearlyTrendChart.tsx
        │   ├── forms/
        │   │   ├── TransactionForm.tsx
        │   │   ├── CustomerForm.tsx
        │   │   ├── SupplierForm.tsx
        │   │   ├── DebtForm.tsx
        │   │   ├── DocumentUploadForm.tsx
        │   │   └── ProductForm.tsx
        │   ├── data-display/
        │   │   ├── DataTable.tsx
        │   │   ├── EmptyState.tsx
        │   │   ├── ErrorState.tsx
        │   │   ├── LoadingSkeleton.tsx
        │   │   ├── DebtBadge.tsx
        │   │   └── LowStockBanner.tsx
        │   ├── passport/
        │   │   ├── PassportCard.tsx
        │   │   ├── ImprovementChecklist.tsx
        │   │   └── SharePassportDialog.tsx
        │   ├── assistant/
        │   │   ├── ChatWindow.tsx
        │   │   ├── ChatMessage.tsx
        │   │   └── StarterQuestions.tsx
        │   └── ui/                       # shadcn/ui components
        │       ├── button.tsx
        │       ├── input.tsx
        │       ├── dialog.tsx
        │       ├── table.tsx
        │       ├── card.tsx
        │       ├── badge.tsx
        │       ├── skeleton.tsx
        │       ├── toast.tsx
        │       ├── select.tsx
        │       ├── tabs.tsx
        │       └── ...
        ├── features/
        │   ├── auth/
        │   │   ├── hooks/useAuth.ts
        │   │   └── api/auth.api.ts
        │   ├── transactions/
        │   │   ├── hooks/useTransactions.ts
        │   │   └── api/transactions.api.ts
        │   ├── customers/
        │   ├── suppliers/
        │   ├── debts/
        │   ├── documents/
        │   ├── inventory/
        │   ├── analytics/
        │   ├── history/
        │   ├── passport/
        │   ├── assistant/
        │   ├── dashboard/
        │   └── settings/
        ├── lib/
        │   ├── api/
        │   │   ├── client.ts             # Axios/fetch wrapper + refresh
        │   │   └── types.ts
        │   ├── utils.ts
        │   ├── constants.ts
        │   └── formatters.ts             # RWF currency, dates
        ├── hooks/
        │   ├── useDebounce.ts
        │   ├── usePagination.ts
        │   └── useTheme.ts
        ├── store/
        │   ├── auth.store.ts
        │   └── ui.store.ts
        ├── i18n/
        │   ├── index.ts
        │   ├── en.json
        │   └── rw.json
        └── styles/
            ├── globals.css
            └── tokens.css                # Navy/Gold design tokens
```
