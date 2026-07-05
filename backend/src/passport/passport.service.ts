import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DebtStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CREDIT_READINESS_LABELS } from '../health-score/health-score.types';
import { buildImprovementChecklist, PassportPayload } from './dto/passport.dto';

/**
 * Digital Business Passport assembly, share links, and public access (PASS-01..05).
 */
@Injectable()
export class PassportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
    private readonly configService: ConfigService,
  ) {}

  async getPassport(ownerId: string): Promise<PassportPayload> {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    return this.buildPassportPayload(business.id);
  }

  async getPublicPassport(token: string): Promise<PassportPayload> {
    const share = await this.prisma.passportShare.findUnique({
      where: { token },
    });

    if (!share || share.revoked) {
      throw new NotFoundException({
        message: 'Share link not found or revoked',
        errorCode: 'PASSPORT_SHARE_NOT_FOUND',
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new UnauthorizedException({
        message: 'Share link has expired',
        errorCode: 'PASSPORT_SHARE_EXPIRED',
      });
    }

    return this.buildPassportPayload(share.businessId);
  }

  async createShareLink(ownerId: string, expiresInDays = 7) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.passportShare.create({
      data: {
        businessId: business.id,
        token,
        expiresAt,
      },
    });

    const frontendUrl = this.configService
      .get<string>('app.frontendUrl', 'http://localhost:5173')
      .replace(/\/$/, '');

    return {
      shareUrl: `${frontendUrl}/passport/public/${token}`,
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  private async buildPassportPayload(businessId: string): Promise<PassportPayload> {
    const business = await this.prisma.business.findUniqueOrThrow({
      where: { id: businessId },
    });

    const [breakdown, transactionCount, documentCount, customerCount, debts] = await Promise.all([
      this.healthScoreService.getBreakdown(businessId),
      this.prisma.transaction.count({ where: { businessId } }),
      this.prisma.document.count({ where: { businessId } }),
      this.prisma.customer.count({ where: { businessId } }),
      this.prisma.debt.findMany({
        where: { businessId },
        select: { status: true },
      }),
    ]);

    const debtsResolved = debts.filter((d) => d.status === DebtStatus.paid).length;
    const resolvedDebtRatio = debts.length > 0 ? debtsResolved / debts.length : 0;

    return {
      passportId: business.passportId,
      business: {
        name: business.name,
        type: business.type,
        industry: business.industry,
        location: business.location,
        yearsOperating: business.yearsOperating,
        numEmployees: business.numEmployees,
      },
      healthScore: breakdown.overall,
      healthScoreBreakdown: {
        records: breakdown.records,
        consistency: breakdown.consistency,
        debtManagement: breakdown.debtManagement,
      },
      creditReadiness: {
        level: breakdown.creditReadiness,
        label: CREDIT_READINESS_LABELS[breakdown.creditReadiness],
      },
      activitySummary: {
        transactionsRecorded: transactionCount,
        documentsUploaded: documentCount,
        customersRegistered: customerCount,
        debtsResolved,
      },
      improvementChecklist: buildImprovementChecklist({
        transactionCount,
        documentCount,
        customerCount,
        resolvedDebtRatio,
      }),
      generatedAt: new Date().toISOString(),
    };
  }
}
