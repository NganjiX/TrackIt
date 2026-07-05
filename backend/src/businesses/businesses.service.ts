import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Business } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CREDIT_READINESS_LABELS, generatePassportId } from '../health-score/health-score.types';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

/**
 * Business profile and onboarding operations.
 */
@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  /**
   * Finds the business owned by a user.
   */
  async findByOwnerId(ownerId: string): Promise<Business | null> {
    return this.prisma.business.findUnique({ where: { ownerId } });
  }

  /**
   * Finds the business owned by a user or throws if missing.
   */
  async requireBusinessByOwner(ownerId: string): Promise<Business> {
    const business = await this.findByOwnerId(ownerId);
    if (!business) {
      throw new NotFoundException({
        message: 'Business not found. Complete onboarding first.',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }
    return business;
  }

  /**
   * Gets the current user's business or throws if not found.
   */
  async getMyBusiness(ownerId: string) {
    const business = await this.requireBusinessByOwner(ownerId);
    return this.toBusinessResponse(business);
  }

  /**
   * Creates business profile after 3-step onboarding wizard (AUTH-06).
   */
  async completeOnboarding(ownerId: string, dto: OnboardingDto) {
    const existing = await this.findByOwnerId(ownerId);
    if (existing?.onboardingComplete) {
      throw new ConflictException({
        message: 'Onboarding already completed',
        errorCode: 'ONBOARDING_COMPLETE',
      });
    }

    let passportId = generatePassportId();
    let attempts = 0;
    while (attempts < 5) {
      const collision = await this.prisma.business.findUnique({ where: { passportId } });
      if (!collision) break;
      passportId = generatePassportId();
      attempts++;
    }

    const business = existing
      ? await this.prisma.business.update({
          where: { id: existing.id },
          data: {
            ...dto,
            passportId,
            onboardingComplete: true,
          },
        })
      : await this.prisma.business.create({
          data: {
            ownerId,
            passportId,
            ...dto,
            onboardingComplete: true,
          },
        });

    await this.healthScoreService.recalculateAndPersist(business.id);
    const updated = await this.prisma.business.findUniqueOrThrow({ where: { id: business.id } });
    return this.toBusinessResponse(updated);
  }

  /**
   * Updates business settings (SET-02).
   */
  async updateMyBusiness(ownerId: string, dto: UpdateBusinessDto) {
    const business = await this.findByOwnerId(ownerId);
    if (!business) {
      throw new NotFoundException({
        message: 'Business not found',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    const updated = await this.prisma.business.update({
      where: { id: business.id },
      data: dto,
    });
    return this.toBusinessResponse(updated);
  }

  private toBusinessResponse(business: Business) {
    return {
      id: business.id,
      passportId: business.passportId,
      name: business.name,
      type: business.type,
      industry: business.industry,
      location: business.location,
      yearsOperating: business.yearsOperating,
      numEmployees: business.numEmployees,
      goals: business.goals,
      currency: business.currency,
      healthScore: business.healthScore,
      creditReadiness: business.creditReadiness,
      creditReadinessLabel: CREDIT_READINESS_LABELS[business.creditReadiness],
      onboardingComplete: business.onboardingComplete,
    };
  }
}
