import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { DebtStatus, DebtType, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CustomersService } from '../customers/customers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto/debt.dto';
import { DebtQueryDto } from './dto/debt-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../common/dto/pagination-query.dto';

export const DEBTS_QUEUE = 'debts';
export const MARK_OVERDUE_JOB = 'mark-overdue';

/**
 * Computes debt status from amounts and due date (DEBT-02, DEBT-04).
 */
export function computeDebtStatus(amount: number, paidAmount: number, dueDate: Date): DebtStatus {
  if (paidAmount >= amount) {
    return DebtStatus.paid;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const isOverdue = due < today;

  if (paidAmount > 0) {
    return isOverdue ? DebtStatus.overdue : DebtStatus.partial;
  }

  return isOverdue ? DebtStatus.overdue : DebtStatus.pending;
}

/**
 * Debt CRUD, payments, summary, and overdue processing (DEBT-01..05).
 */
@Injectable()
export class DebtsService implements OnModuleInit {
  private readonly logger = new Logger(DebtsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
    private readonly customersService: CustomersService,
    private readonly suppliersService: SuppliersService,
    @InjectQueue(DEBTS_QUEUE) private readonly debtsQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.debtsQueue.add(
        MARK_OVERDUE_JOB,
        {},
        {
          repeat: { pattern: '0 0 * * *' },
          jobId: 'debts-mark-overdue-daily',
        },
      );
      this.logger.log('Scheduled daily overdue debt job');
    } catch (error) {
      this.logger.warn(
        `Could not schedule overdue debt job (Redis may be unavailable): ${(error as Error).message}`,
      );
    }
  }

  async findAll(ownerId: string, query: DebtQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    await this.markOverdueForBusiness(business.id);

    const { skip, take, page, limit } = getPaginationParams(query);
    const where: Prisma.DebtWhereInput = { businessId: business.id };

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { partyName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.debt.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: query.sortOrder ?? 'asc' },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      this.prisma.debt.count({ where }),
    ]);

    return {
      data: items.map((d) => this.toResponse(d)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getSummary(ownerId: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    await this.markOverdueForBusiness(business.id);

    const openDebts = await this.prisma.debt.findMany({
      where: { businessId: business.id, status: { not: DebtStatus.paid } },
      select: { type: true, amount: true, paidAmount: true, status: true },
    });

    let totalReceivable = 0;
    let totalPayable = 0;
    let overdueCount = 0;

    for (const debt of openDebts) {
      const remaining = Number(debt.amount) - Number(debt.paidAmount);
      if (debt.type === DebtType.receivable) {
        totalReceivable += remaining;
      } else {
        totalPayable += remaining;
      }
      if (debt.status === DebtStatus.overdue) {
        overdueCount += 1;
      }
    }

    return {
      totalReceivable,
      totalPayable,
      overdueCount,
      currency: business.currency,
    };
  }

  async findOne(ownerId: string, id: string) {
    const debt = await this.getScopedDebt(ownerId, id);
    await this.markOverdueForBusiness(debt.businessId);

    const refreshed = await this.prisma.debt.findFirst({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    if (!refreshed) {
      throw new NotFoundException({ message: 'Debt not found', errorCode: 'DEBT_NOT_FOUND' });
    }

    return this.toDetailResponse(refreshed);
  }

  async create(ownerId: string, userId: string, dto: CreateDebtDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    this.validateDebtLinks(dto);

    if (dto.customerId) {
      await this.customersService.findOne(ownerId, dto.customerId);
    }
    if (dto.supplierId) {
      await this.suppliersService.findOne(ownerId, dto.supplierId);
    }

    const status = computeDebtStatus(dto.amount, 0, new Date(dto.dueDate));

    const debt = await this.prisma.debt.create({
      data: {
        businessId: business.id,
        type: dto.type,
        partyName: dto.partyName,
        customerId: dto.type === DebtType.receivable ? dto.customerId : null,
        supplierId: dto.type === DebtType.payable ? dto.supplierId : null,
        amount: dto.amount,
        paidAmount: 0,
        dueDate: new Date(dto.dueDate),
        status,
        description: dto.description,
        createdById: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await this.syncBalancesAndScore(debt.businessId, debt.customerId, debt.supplierId);
    return this.toResponse(debt);
  }

  async update(ownerId: string, id: string, dto: UpdateDebtDto) {
    const existing = await this.getScopedDebt(ownerId, id);

    if (existing.status === DebtStatus.paid) {
      throw new BadRequestException({
        message: 'Cannot update a fully paid debt',
        errorCode: 'DEBT_ALREADY_PAID',
      });
    }

    const amount = dto.amount ?? Number(existing.amount);
    const paidAmount = Number(existing.paidAmount);
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : existing.dueDate;

    if (dto.amount !== undefined && paidAmount > amount) {
      throw new BadRequestException({
        message: 'Amount cannot be less than already paid amount',
        errorCode: 'DEBT_AMOUNT_TOO_LOW',
      });
    }

    const status = computeDebtStatus(amount, paidAmount, dueDate);

    const debt = await this.prisma.debt.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status,
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await this.syncBalancesAndScore(debt.businessId, debt.customerId, debt.supplierId);
    return this.toResponse(debt);
  }

  async recordPayment(ownerId: string, id: string, dto: RecordDebtPaymentDto) {
    const existing = await this.getScopedDebt(ownerId, id);

    if (existing.status === DebtStatus.paid) {
      throw new BadRequestException({
        message: 'Debt is already fully paid',
        errorCode: 'DEBT_ALREADY_PAID',
      });
    }

    const amount = Number(existing.amount);
    const currentPaid = Number(existing.paidAmount);
    const remaining = amount - currentPaid;

    if (dto.amount > remaining) {
      throw new BadRequestException({
        message: `Payment exceeds remaining balance of ${remaining}`,
        errorCode: 'DEBT_PAYMENT_EXCEEDS_BALANCE',
      });
    }

    const newPaidAmount = currentPaid + dto.amount;
    const status = computeDebtStatus(amount, newPaidAmount, existing.dueDate);

    const [, debt] = await this.prisma.$transaction([
      this.prisma.debtPayment.create({
        data: {
          debtId: id,
          amount: dto.amount,
          note: dto.note,
        },
      }),
      this.prisma.debt.update({
        where: { id },
        data: { paidAmount: newPaidAmount, status },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
    ]);

    await this.syncBalancesAndScore(debt.businessId, debt.customerId, debt.supplierId);
    return this.toResponse(debt);
  }

  async remove(ownerId: string, id: string) {
    const debt = await this.getScopedDebt(ownerId, id);
    await this.prisma.debt.delete({ where: { id } });
    await this.syncBalancesAndScore(debt.businessId, debt.customerId, debt.supplierId);
    return { message: 'Debt deleted' };
  }

  /**
   * Marks all overdue debts across all businesses (DEBT-04 cron job).
   */
  async markOverdueDebts(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCandidates = await this.prisma.debt.findMany({
      where: {
        status: { in: [DebtStatus.pending, DebtStatus.partial] },
        dueDate: { lt: today },
      },
      select: { id: true, businessId: true },
    });

    if (overdueCandidates.length === 0) {
      return 0;
    }

    await this.prisma.debt.updateMany({
      where: { id: { in: overdueCandidates.map((d) => d.id) } },
      data: { status: DebtStatus.overdue },
    });

    const businessIds = [...new Set(overdueCandidates.map((d) => d.businessId))];
    for (const businessId of businessIds) {
      await this.healthScoreService.recalculateAndPersist(businessId);
    }

    this.logger.log(`Marked ${overdueCandidates.length} debts as overdue`);
    return overdueCandidates.length;
  }

  private async markOverdueForBusiness(businessId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.debt.updateMany({
      where: {
        businessId,
        status: { in: [DebtStatus.pending, DebtStatus.partial] },
        dueDate: { lt: today },
      },
      data: { status: DebtStatus.overdue },
    });

    if (result.count > 0) {
      await this.healthScoreService.recalculateAndPersist(businessId);
    }
  }

  private validateDebtLinks(dto: CreateDebtDto): void {
    if (dto.type === DebtType.receivable && dto.supplierId) {
      throw new BadRequestException({
        message: 'Receivable debts cannot be linked to a supplier',
        errorCode: 'DEBT_INVALID_LINK',
      });
    }
    if (dto.type === DebtType.payable && dto.customerId) {
      throw new BadRequestException({
        message: 'Payable debts cannot be linked to a customer',
        errorCode: 'DEBT_INVALID_LINK',
      });
    }
  }

  private async syncBalancesAndScore(
    businessId: string,
    customerId: string | null,
    supplierId: string | null,
  ): Promise<void> {
    if (customerId) {
      await this.customersService.recalculateBalances(customerId);
    }
    if (supplierId) {
      await this.suppliersService.recalculateBalances(supplierId);
    }
    await this.healthScoreService.recalculateAndPersist(businessId);
  }

  private async getScopedDebt(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const debt = await this.prisma.debt.findFirst({
      where: { id, businessId: business.id },
    });
    if (!debt) {
      throw new NotFoundException({ message: 'Debt not found', errorCode: 'DEBT_NOT_FOUND' });
    }
    return debt;
  }

  private toResponse(debt: {
    id: string;
    type: DebtType;
    partyName: string;
    amount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    dueDate: Date;
    status: DebtStatus;
    description: string;
    customerId: string | null;
    supplierId: string | null;
    customer?: { id: string; name: string } | null;
    supplier?: { id: string; name: string } | null;
    createdAt: Date;
  }) {
    const amount = Number(debt.amount);
    const paidAmount = Number(debt.paidAmount);
    return {
      id: debt.id,
      type: debt.type,
      partyName: debt.partyName,
      amount,
      paidAmount,
      remainingAmount: amount - paidAmount,
      dueDate: debt.dueDate.toISOString().split('T')[0],
      status: debt.status,
      description: debt.description,
      customerId: debt.customerId,
      supplierId: debt.supplierId,
      customer: debt.customer ?? null,
      supplier: debt.supplier ?? null,
      createdAt: debt.createdAt.toISOString(),
    };
  }

  private toDetailResponse(debt: {
    id: string;
    type: DebtType;
    partyName: string;
    amount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    dueDate: Date;
    status: DebtStatus;
    description: string;
    customerId: string | null;
    supplierId: string | null;
    customer?: { id: string; name: string } | null;
    supplier?: { id: string; name: string } | null;
    createdAt: Date;
    payments: Array<{
      id: string;
      amount: Prisma.Decimal;
      paidAt: Date;
      note: string | null;
    }>;
  }) {
    return {
      ...this.toResponse(debt),
      payments: debt.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paidAt: p.paidAt.toISOString(),
        note: p.note,
      })),
    };
  }
}
