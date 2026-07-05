import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, DebtType, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import {
  PaginationQueryDto,
  buildPaginationMeta,
  getPaginationParams,
} from '../common/dto/pagination-query.dto';

/**
 * Customer management with computed purchase and debt balances (CUST-01..04).
 */
@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  async findAll(ownerId: string, query: PaginationQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.CustomerWhereInput = { businessId: business.id };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { name: query.sortOrder ?? 'asc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: items.map((c) => this.toResponse(c)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(ownerId: string, id: string) {
    const customer = await this.getScopedCustomer(ownerId, id);
    return this.toResponse(customer);
  }

  async create(ownerId: string, userId: string, dto: CreateCustomerDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const customer = await this.prisma.customer.create({
      data: {
        businessId: business.id,
        ...dto,
        createdById: userId,
      },
    });
    await this.healthScoreService.recalculateAndPersist(business.id);
    return this.toResponse(customer);
  }

  async update(ownerId: string, id: string, dto: UpdateCustomerDto) {
    await this.getScopedCustomer(ownerId, id);
    const customer = await this.prisma.customer.update({ where: { id }, data: dto });
    return this.toResponse(customer);
  }

  async remove(ownerId: string, id: string) {
    const customer = await this.getScopedCustomer(ownerId, id);
    await this.prisma.customer.delete({ where: { id } });
    await this.healthScoreService.recalculateAndPersist(customer.businessId);
    return { message: 'Customer deleted' };
  }

  /**
   * Recomputes cached totalPurchases and debtBalance for a customer (CUST-02).
   */
  async recalculateBalances(customerId: string): Promise<void> {
    const [purchaseAgg, debts] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { customerId, type: TransactionType.sale },
        _sum: { amount: true },
      }),
      this.prisma.debt.findMany({
        where: {
          customerId,
          type: DebtType.receivable,
          status: { not: DebtStatus.paid },
        },
        select: { amount: true, paidAmount: true },
      }),
    ]);

    const totalPurchases = Number(purchaseAgg._sum.amount ?? 0);
    const debtBalance = debts.reduce((sum, d) => sum + Number(d.amount) - Number(d.paidAmount), 0);

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { totalPurchases, debtBalance },
    });
  }

  private async getScopedCustomer(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId: business.id },
    });
    if (!customer) {
      throw new NotFoundException({
        message: 'Customer not found',
        errorCode: 'CUSTOMER_NOT_FOUND',
      });
    }
    return customer;
  }

  private toResponse(customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    totalPurchases: Prisma.Decimal;
    debtBalance: Prisma.Decimal;
    createdAt: Date;
  }) {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      totalPurchases: Number(customer.totalPurchases),
      debtBalance: Number(customer.debtBalance),
      hasDebt: Number(customer.debtBalance) > 0,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
