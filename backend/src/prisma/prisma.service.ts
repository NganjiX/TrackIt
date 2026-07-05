import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * Prisma service wrapping the database client with lifecycle hooks.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const configuredUrl =
      configService.get<string>('database.url') ??
      process.env.DATABASE_URL ??
      'postgresql://smartledger:smartledger@localhost:5432/smartledger?schema=public';
    const normalizedUrl = configuredUrl.trim();

    super({
      datasources: {
        db: { url: normalizedUrl },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      const configuredUrl =
        this.configService.get<string>('database.url') ?? process.env.DATABASE_URL ?? '';
      const sanitizedUrl = configuredUrl
        ? configuredUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@')
        : '(missing DATABASE_URL)';
      this.logger.error(`Database connection failed using ${sanitizedUrl}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Checks database connectivity for health probes.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
