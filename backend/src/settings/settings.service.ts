import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CREDIT_READINESS_LABELS } from '../health-score/health-score.types';
import { UpdateLanguageDto, UpdateProfileDto } from './dto/settings.dto';

/**
 * User profile and health settings (SET-01, SET-03, I18N-03).
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.toProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.usersService.updateProfile(userId, dto.fullName);
    const user = await this.usersService.findById(userId);
    return this.usersService.toProfile(user);
  }

  async updateLanguage(userId: string, dto: UpdateLanguageDto) {
    await this.usersService.updateLanguage(userId, dto.language);
    const user = await this.usersService.findById(userId);
    return this.usersService.toProfile(user);
  }

  async getHealth(userId: string) {
    const business = await this.businessesService.requireBusinessByOwner(userId);
    const breakdown = await this.healthScoreService.getBreakdown(business.id);

    return {
      healthScore: breakdown.overall,
      creditReadiness: {
        level: breakdown.creditReadiness,
        label: CREDIT_READINESS_LABELS[breakdown.creditReadiness],
      },
      breakdown: {
        records: breakdown.records,
        consistency: breakdown.consistency,
        debtManagement: breakdown.debtManagement,
      },
    };
  }
}
