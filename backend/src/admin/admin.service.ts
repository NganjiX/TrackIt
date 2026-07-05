import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CREDIT_READINESS_LABELS } from '../health-score/health-score.types';
import { UpdateUserRoleDto } from './dto/admin.dto';
import {
  PaginationQueryDto,
  buildPaginationMeta,
  getPaginationParams,
} from '../common/dto/pagination-query.dto';

/**
 * Platform administration for users and businesses (UC-14).
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getStats() {
    const [userCount, businessCount, transactionCount, documentCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.transaction.count(),
      this.prisma.document.count(),
    ]);

    return {
      userCount,
      businessCount,
      transactionCount,
      documentCount,
    };
  }

  async listUsers(query: PaginationQueryDto) {
    const { page, limit } = getPaginationParams(query);
    return this.usersService.findAllForAdmin(page, limit);
  }

  async getUser(id: string) {
    const user = await this.usersService.findById(id);
    return {
      ...this.usersService.toProfile(user),
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  async listBusinesses(query: PaginationQueryDto) {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      this.prisma.business.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.business.count(),
    ]);

    return {
      data: items.map((b) => ({
        id: b.id,
        passportId: b.passportId,
        name: b.name,
        type: b.type,
        location: b.location,
        healthScore: b.healthScore,
        creditReadiness: b.creditReadiness,
        creditReadinessLabel: CREDIT_READINESS_LABELS[b.creditReadiness],
        onboardingComplete: b.onboardingComplete,
        owner: b.owner,
        createdAt: b.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getBusiness(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, fullName: true, role: true } },
        _count: {
          select: {
            transactions: true,
            customers: true,
            documents: true,
            debts: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException({
        message: 'Business not found',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    return {
      id: business.id,
      passportId: business.passportId,
      name: business.name,
      type: business.type,
      industry: business.industry,
      location: business.location,
      yearsOperating: business.yearsOperating,
      numEmployees: business.numEmployees,
      healthScore: business.healthScore,
      creditReadiness: business.creditReadiness,
      creditReadinessLabel: CREDIT_READINESS_LABELS[business.creditReadiness],
      onboardingComplete: business.onboardingComplete,
      owner: business.owner,
      counts: business._count,
      createdAt: business.createdAt.toISOString(),
    };
  }
}
