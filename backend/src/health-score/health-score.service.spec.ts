import { Test, TestingModule } from '@nestjs/testing';
import { DebtStatus } from '@prisma/client';
import { HealthScoreService } from './health-score.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthScoreService', () => {
  let service: HealthScoreService;
  let prisma: {
    transaction: { count: jest.Mock; findMany: jest.Mock };
    document: { count: jest.Mock };
    debt: { findMany: jest.Mock };
    business: { update: jest.Mock };
    healthScoreLog: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        count: jest.fn().mockResolvedValue(10),
        findMany: jest
          .fn()
          .mockResolvedValue([{ date: new Date('2026-01-15') }, { date: new Date('2026-02-10') }]),
      },
      document: { count: jest.fn().mockResolvedValue(3) },
      debt: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ status: DebtStatus.paid }, { status: DebtStatus.pending }]),
      },
      business: { update: jest.fn() },
      healthScoreLog: { create: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthScoreService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<HealthScoreService>(HealthScoreService);
  });

  it('calculates health score from sub-metrics', async () => {
    const result = await service.calculateForBusiness('biz-1');

    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.records).toBe(45);
    expect(result.debtManagement).toBe(50);
  });

  it('uses neutral debt score when no debts exist', async () => {
    prisma.debt.findMany.mockResolvedValue([]);

    const result = await service.calculateForBusiness('biz-1');

    expect(result.debtManagement).toBe(50);
  });

  it('persists recalculated score', async () => {
    await service.recalculateAndPersist('biz-1');

    expect(prisma.business.update).toHaveBeenCalled();
    expect(prisma.healthScoreLog.create).toHaveBeenCalled();
  });
});
