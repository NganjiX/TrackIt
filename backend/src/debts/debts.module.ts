import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DebtsController } from './debts.controller';
import { DebtsService, DEBTS_QUEUE } from './debts.service';
import { DebtsProcessor } from './debts.processor';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';
import { CustomersModule } from '../customers/customers.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
        },
      }),
    }),
    BullModule.registerQueue({ name: DEBTS_QUEUE }),
    BusinessesModule,
    HealthScoreModule,
    CustomersModule,
    SuppliersModule,
  ],
  controllers: [DebtsController],
  providers: [DebtsService, DebtsProcessor],
  exports: [DebtsService],
})
export class DebtsModule {}
