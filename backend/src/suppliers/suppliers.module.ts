import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [BusinessesModule, HealthScoreModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
