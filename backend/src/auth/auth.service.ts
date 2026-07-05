import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { Response } from 'express';
import { AuthProvider, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { GoogleProfile } from './strategies/google.strategy';

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const RESET_EXPIRY_HOURS = 1;

/**
 * Handles registration, login, OTP verification, password reset, and token management.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Registers a new user and sends OTP verification email (AUTH-01, AUTH-03).
   */
  async register(dto: RegisterDto): Promise<{ message: string; userId: string }> {
    const email = dto.email.toLowerCase();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException({
        message: 'Email already registered',
        errorCode: 'EMAIL_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        authProvider: AuthProvider.local,
      },
    });

    await this.createAndSendOtp(user);
    return { message: 'OTP sent to email', userId: user.id };
  }

  /**
   * Verifies the 6-digit OTP code sent during registration (AUTH-03).
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid verification request',
        errorCode: 'INVALID_OTP',
      });
    }

    const otp = await this.prisma.otpVerification.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException({
        message: 'Invalid or expired OTP',
        errorCode: 'INVALID_OTP',
      });
    }

    await this.prisma.$transaction([
      this.prisma.otpVerification.update({ where: { id: otp.id }, data: { used: true } }),
      this.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
    ]);

    return { message: 'Email verified successfully' };
  }

  /**
   * Resends OTP to unverified user.
   */
  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      return { message: 'If the account exists, a new OTP has been sent' };
    }
    await this.createAndSendOtp(user);
    return { message: 'If the account exists, a new OTP has been sent' };
  }

  /**
   * Authenticates user with email/password and returns tokens (AUTH-05).
   */
  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException({
        message: 'Email not verified',
        errorCode: 'EMAIL_NOT_VERIFIED',
      });
    }

    return this.issueTokens(user, res);
  }

  /**
   * Rotates refresh token and issues new access token (AUTH-05).
   */
  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Refresh token missing',
        errorCode: 'REFRESH_MISSING',
      });
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
      include: {
        user: { include: { business: { select: { id: true, onboardingComplete: true } } } },
      },
    });

    if (!stored) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH',
      });
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    return this.issueTokens(stored.user, res);
  }

  /**
   * Revokes refresh token on logout.
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, revoked: false },
        data: { revoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * Sends password reset link via email (AUTH-04).
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      const rawToken = createHash('sha256').update(`${user.id}-${Date.now()}`).digest('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const frontendUrl = this.config.get<string>('app.frontendUrl');
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl, user.fullName);
    }
    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Sets new password using reset token (AUTH-04).
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
    });

    if (!resetToken) {
      throw new BadRequestException({
        message: 'Invalid or expired reset token',
        errorCode: 'INVALID_RESET_TOKEN',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { revoked: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  /**
   * Handles Google OAuth callback — creates or links user (AUTH-02).
   */
  async googleLogin(profile: GoogleProfile, res: Response) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.googleId }, { email: profile.email.toLowerCase() }] },
      include: { business: { select: { id: true, onboardingComplete: true } } },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          fullName: profile.fullName,
          googleId: profile.googleId,
          authProvider: AuthProvider.google,
          emailVerified: true,
        },
        include: { business: { select: { id: true, onboardingComplete: true } } },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId, emailVerified: true },
        include: { business: { select: { id: true, onboardingComplete: true } } },
      });
    }

    return this.issueTokens(user, res);
  }

  /**
   * Returns current authenticated user profile.
   */
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.toProfile(user);
  }

  private async createAndSendOtp(user: User): Promise<void> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: { userId: user.id, code, expiresAt },
    });

    await this.mailService.sendOtpEmail(user.email, code, user.fullName);
  }

  private async issueTokens(
    user: User & { business?: { id: string; onboardingComplete: boolean } | null },
    res: Response,
  ) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessSecret = this.config.get<string>('jwt.accessSecret')!;
    const refreshSecret = this.config.get<string>('jwt.refreshSecret')!;
    const accessExpiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m');
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn', '7d');

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const refreshExpiryMs = this.parseExpiry(refreshExpiresIn);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshExpiryMs),
      },
    });

    const isProduction = this.config.get<string>('app.nodeEnv') === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: refreshExpiryMs,
      path: '/api/v1/auth',
    });

    return {
      accessToken,
      expiresIn: this.parseExpiry(accessExpiresIn) / 1000,
      user: this.usersService.toProfile(user),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] ?? 60000);
  }
}
