import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, DebtType, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import {
  PaginationQueryDto,
  buildPaginationMeta,
  getPaginationParams,
} from '../common/dto/pagination-query.dto';

/**
 * Supplier management with computed payment and balance fields (SUPP-01..04).
 */
@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  async findAll(ownerId: string, query: PaginationQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.SupplierWhereInput = { businessId: business.id };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { name: query.sortOrder ?? 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: items.map((s) => this.toResponse(s)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(ownerId: string, id: string) {
    const supplier = await this.getScopedSupplier(ownerId, id);
    return this.toResponse(supplier);
  }

  async create(ownerId: string, userId: string, dto: CreateSupplierDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const supplier = await this.prisma.supplier.create({
      data: {
        businessId: business.id,
        ...dto,
        createdById: userId,
      },
    });
    return this.toResponse(supplier);
  }

  async update(ownerId: string, id: string, dto: UpdateSupplierDto) {
    await this.getScopedSupplier(ownerId, id);
    const supplier = await this.prisma.supplier.update({ where: { id }, data: dto });
    return this.toResponse(supplier);
  }

  async remove(ownerId: string, id: string) {
    await this.getScopedSupplier(ownerId, id);
    await this.prisma.supplier.delete({ where: { id } });
    return { message: 'Supplier deleted' };
  }

  /**
   * Recomputes cached totalPayments and outstandingBalance (SUPP-02).
   */
  async recalculateBalances(supplierId: string): Promise<void> {
    const [paymentAgg, debts] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { supplierId, type: TransactionType.purchase },
        _sum: { amount: true },
      }),
      this.prisma.debt.findMany({
        where: {
          supplierId,
          type: DebtType.payable,
          status: { not: DebtStatus.paid },
        },
        select: { amount: true, paidAmount: true },
      }),
    ]);

    const totalPayments = Number(paymentAgg._sum.amount ?? 0);
    const outstandingBalance = debts.reduce(
      (sum, d) => sum + Number(d.amount) - Number(d.paidAmount),
      0,
    );

    await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { totalPayments, outstandingBalance },
    });
  }

  private async getScopedSupplier(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, businessId: business.id },
    });
    if (!supplier) {
      throw new NotFoundException({
        message: 'Supplier not found',
        errorCode: 'SUPPLIER_NOT_FOUND',
      });
    }
    return supplier;
  }

  private toResponse(supplier: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    totalPayments: Prisma.Decimal;
    outstandingBalance: Prisma.Decimal;
    createdAt: Date;
  }) {
    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      totalPayments: Number(supplier.totalPayments),
      outstandingBalance: Number(supplier.outstandingBalance),
      hasOutstanding: Number(supplier.outstandingBalance) > 0,
      createdAt: supplier.createdAt.toISOString(),
    };
  }
}
