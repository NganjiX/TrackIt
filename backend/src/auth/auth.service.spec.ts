import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { create: jest.Mock; update: jest.Mock; findFirst: jest.Mock };
    otpVerification: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    refreshToken: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
  let usersService: { findByEmail: jest.Mock; findById: jest.Mock; toProfile: jest.Mock };
  let mailService: { sendOtpEmail: jest.Mock };

  const mockResponse = () => {
    const res: Partial<{ cookie: jest.Mock }> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    prisma = {
      user: { create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
      otpVerification: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      refreshToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toProfile: jest.fn().mockReturnValue({ id: '1', email: 'test@test.com' }),
    };
    mailService = { sendOtpEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                'jwt.accessSecret': 'access-secret',
                'jwt.refreshSecret': 'refresh-secret',
                'jwt.accessExpiresIn': '15m',
                'jwt.refreshExpiresIn': '7d',
                'app.nodeEnv': 'test',
                'app.frontendUrl': 'http://localhost:5173',
              };
              return map[key];
            }),
          },
        },
        { provide: MailService, useValue: mailService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user and sends OTP', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@test.com',
      fullName: 'Test User',
    });
    prisma.otpVerification.create.mockResolvedValue({});

    const result = await service.register({
      email: 'new@test.com',
      password: 'Password123',
      fullName: 'Test User',
    });

    expect(result.message).toBe('OTP sent to email');
    expect(result.userId).toBe('user-1');
    expect(mailService.sendOtpEmail).toHaveBeenCalled();
  });

  it('throws conflict when email already exists', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'existing@test.com',
        password: 'Password123',
        fullName: 'Test',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects login for unverified email', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G2oX.Q3Kj8Y5Ge',
      emailVerified: false,
    });

    await expect(
      service.login({ email: 'test@test.com', password: 'Password123!' }, mockResponse() as never),
    ).rejects.toThrow(UnauthorizedException);
  });
});
