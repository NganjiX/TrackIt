import { registerAs } from '@nestjs/config';

/**
 * Database connection configuration for Prisma.
 */
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
