import { registerAs } from '@nestjs/config';

/**
 * SMTP / email delivery configuration for OTP and password reset.
 */
export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST ?? 'localhost',
  port: parseInt(process.env.MAIL_PORT ?? '1025', 10),
  from: process.env.MAIL_FROM ?? 'noreply@smartledger.rw',
}));
