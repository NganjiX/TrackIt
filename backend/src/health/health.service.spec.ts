import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: { isHealthy: jest.Mock };

  beforeEach(async () => {
    prisma = { isHealthy: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('returns ok when database is connected', async () => {
    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('returns error when database is disconnected', async () => {
    prisma.isHealthy.mockResolvedValue(false);

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.database).toBe('disconnected');
  });
});
