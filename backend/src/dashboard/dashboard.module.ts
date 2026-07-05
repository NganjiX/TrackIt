import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [BusinessesModule, HealthScoreModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
