import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CustomersService } from '../customers/customers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../common/dto/pagination-query.dto';

/**
 * Transaction CRUD with search, filters, and balance side-effects.
 */
@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
    private readonly customersService: CustomersService,
    private readonly suppliersService: SuppliersService,
  ) {}

  /**
   * Lists transactions with type filter and search (TXN-03, TXN-04).
   */
  async findAll(ownerId: string, query: TransactionQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.TransactionWhereInput = { businessId: business.id };

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { productService: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'desc' }
      : { date: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: items.map((t) => this.toResponse(t)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Gets a single transaction by ID scoped to the owner's business.
   */
  async findOne(ownerId: string, id: string) {
    const transaction = await this.getScopedTransaction(ownerId, id);
    return this.toResponse(transaction);
  }

  /**
   * Creates a transaction (TXN-01, TXN-02).
   */
  async create(ownerId: string, userId: string, dto: CreateTransactionDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    await this.validateReferences(business.id, dto.type, dto.customerId, dto.supplierId);

    const transaction = await this.prisma.transaction.create({
      data: {
        businessId: business.id,
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        paymentStatus: dto.paymentStatus,
        productService: dto.productService,
        customerId: dto.customerId,
        supplierId: dto.supplierId,
        receiptUrl: dto.receiptUrl,
        createdById: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await this.afterTransactionChange(business.id, dto.customerId, dto.supplierId);
    return this.toResponse(transaction);
  }

  /**
   * Updates an existing transaction.
   */
  async update(ownerId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.getScopedTransaction(ownerId, id);
    const type = dto.type ?? existing.type;

    await this.validateReferences(
      existing.businessId,
      type,
      dto.customerId === null ? undefined : (dto.customerId ?? existing.customerId ?? undefined),
      dto.supplierId === null ? undefined : (dto.supplierId ?? existing.supplierId ?? undefined),
    );

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        customerId: dto.customerId,
        supplierId: dto.supplierId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    const customerIds = new Set(
      [existing.customerId, transaction.customerId].filter(Boolean) as string[],
    );
    const supplierIds = new Set(
      [existing.supplierId, transaction.supplierId].filter(Boolean) as string[],
    );

    await this.afterTransactionChange(existing.businessId, [...customerIds], [...supplierIds]);

    return this.toResponse(transaction);
  }

  /**
   * Deletes a transaction.
   */
  async remove(ownerId: string, id: string) {
    const existing = await this.getScopedTransaction(ownerId, id);
    await this.prisma.transaction.delete({ where: { id } });
    await this.afterTransactionChange(
      existing.businessId,
      existing.customerId ? [existing.customerId] : [],
      existing.supplierId ? [existing.supplierId] : [],
    );
    return { message: 'Transaction deleted' };
  }

  private async getScopedTransaction(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, businessId: business.id },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
    if (!transaction) {
      throw new NotFoundException({
        message: 'Transaction not found',
        errorCode: 'TRANSACTION_NOT_FOUND',
      });
    }
    return transaction;
  }

  private async validateReferences(
    businessId: string,
    type: TransactionType,
    customerId?: string,
    supplierId?: string,
  ) {
    if (customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, businessId },
      });
      if (!customer) {
        throw new BadRequestException({
          message: 'Customer not found',
          errorCode: 'CUSTOMER_NOT_FOUND',
        });
      }
    }
    if (supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: supplierId, businessId },
      });
      if (!supplier) {
        throw new BadRequestException({
          message: 'Supplier not found',
          errorCode: 'SUPPLIER_NOT_FOUND',
        });
      }
    }
    if (type === TransactionType.sale && supplierId) {
      throw new BadRequestException({
        message: 'Sales cannot reference a supplier',
        errorCode: 'INVALID_REFERENCE',
      });
    }
    if (type === TransactionType.expense && (customerId || supplierId)) {
      throw new BadRequestException({
        message: 'Expenses cannot reference customers or suppliers',
        errorCode: 'INVALID_REFERENCE',
      });
    }
  }

  private async afterTransactionChange(
    businessId: string,
    customerIds?: string | string[],
    supplierIds?: string | string[],
  ) {
    const cIds = Array.isArray(customerIds) ? customerIds : customerIds ? [customerIds] : [];
    const sIds = Array.isArray(supplierIds) ? supplierIds : supplierIds ? [supplierIds] : [];

    await Promise.all([
      ...cIds.map((id) => this.customersService.recalculateBalances(id)),
      ...sIds.map((id) => this.suppliersService.recalculateBalances(id)),
      this.healthScoreService.recalculateAndPersist(businessId),
    ]);
  }

  private toResponse(transaction: {
    id: string;
    type: string;
    category: string;
    amount: Prisma.Decimal;
    description: string;
    date: Date;
    paymentStatus: string;
    productService: string;
    customerId: string | null;
    supplierId: string | null;
    receiptUrl: string | null;
    createdAt: Date;
    customer?: { id: string; name: string } | null;
    supplier?: { id: string; name: string } | null;
  }) {
    return {
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount),
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      paymentStatus: transaction.paymentStatus,
      productService: transaction.productService,
      customerId: transaction.customerId,
      supplierId: transaction.supplierId,
      receiptUrl: transaction.receiptUrl,
      customer: transaction.customer,
      supplier: transaction.supplier,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
