import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

/**
 * User data access and profile operations.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  /**
   * Finds a user by ID with optional business relation.
   */
  async findById(
    id: string,
  ): Promise<User & { business?: { id: string; onboardingComplete: boolean } | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { business: { select: { id: true, onboardingComplete: true } } },
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found', errorCode: 'USER_NOT_FOUND' });
    }
    return user;
  }

  /**
   * Returns sanitized user profile for API responses.
   */
  toProfile(user: User & { business?: { id: string; onboardingComplete: boolean } | null }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
      language: user.language,
      businessId: user.business?.id ?? null,
      onboardingComplete: user.business?.onboardingComplete ?? false,
    };
  }

  async updateProfile(userId: string, fullName: string): Promise<User> {
    await this.findById(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { fullName },
    });
  }

  async updateLanguage(userId: string, language: string): Promise<User> {
    await this.findById(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { language },
    });
  }

  async findAllForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { business: { select: { id: true, name: true, onboardingComplete: true } } },
      }),
      this.prisma.user.count(),
    ]);
    return {
      data: items.map((u) => ({
        ...this.toProfile(u),
        createdAt: u.createdAt.toISOString(),
        businessName: u.business?.name ?? null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async updateRole(userId: string, role: UserRole) {
    await this.findById(userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { business: { select: { id: true, onboardingComplete: true } } },
    });
    return this.toProfile(updated);
  }
}
