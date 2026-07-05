import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { UsersModule } from '../users/users.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [UsersModule, BusinessesModule, HealthScoreModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
