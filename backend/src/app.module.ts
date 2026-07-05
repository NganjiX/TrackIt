import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { HealthScoreModule } from './health-score/health-score.module';
import { BusinessesModule } from './businesses/businesses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DebtsModule } from './debts/debts.module';
import { DocumentsModule } from './documents/documents.module';
import { InventoryModule } from './inventory/inventory.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HistoryModule } from './history/history.module';
import { PassportModule } from './passport/passport.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';

/**
 * Root application module — feature modules added in subsequent phases.
 */
@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    HealthScoreModule,
    BusinessesModule,
    DashboardModule,
    TransactionsModule,
    CustomersModule,
    SuppliersModule,
    DebtsModule,
    DocumentsModule,
    InventoryModule,
    AnalyticsModule,
    HistoryModule,
    PassportModule,
    AiAssistantModule,
    SettingsModule,
    AdminModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
