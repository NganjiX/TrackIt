import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

/**
 * Aggregates dependency health for the /health endpoint.
 */
@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const dbHealthy = await this.prisma.isHealthy();

    return {
      status: dbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  }
}
