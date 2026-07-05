import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [BusinessesModule, HealthScoreModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
