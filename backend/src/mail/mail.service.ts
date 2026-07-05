import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Sends transactional emails (OTP codes, password reset links) via Nodemailer.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: false,
    });
  }

  /**
   * Sends a 6-digit OTP verification code to the user's email.
   */
  async sendOtpEmail(to: string, code: string, fullName: string): Promise<void> {
    const from = this.config.get<string>('mail.from');
    await this.transporter.sendMail({
      from,
      to,
      subject: 'SmartLedger — Verify Your Email',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1A2642;">SmartLedger</h2>
          <p>Hello ${fullName},</p>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; color: #D4A017; letter-spacing: 8px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    this.logger.log(`OTP email sent to ${to}`);
  }

  /**
   * Sends a time-limited password reset link.
   */
  async sendPasswordResetEmail(to: string, resetUrl: string, fullName: string): Promise<void> {
    const from = this.config.get<string>('mail.from');
    await this.transporter.sendMail({
      from,
      to,
      subject: 'SmartLedger — Reset Your Password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1A2642;">SmartLedger</h2>
          <p>Hello ${fullName},</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #D4A017; color: #1A2642; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
      `,
    });
    this.logger.log(`Password reset email sent to ${to}`);
  }
}
