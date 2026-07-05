import { Module } from '@nestjs/common';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';
import { PassportPdfService } from './passport-pdf.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [BusinessesModule, HealthScoreModule],
  controllers: [PassportController],
  providers: [PassportService, PassportPdfService],
  exports: [PassportService],
})
export class PassportModule {}
