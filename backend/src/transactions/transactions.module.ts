import { Module, forwardRef } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';
import { CustomersModule } from '../customers/customers.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    BusinessesModule,
    HealthScoreModule,
    forwardRef(() => CustomersModule),
    forwardRef(() => SuppliersModule),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
