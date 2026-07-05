import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Passport JWT strategy validating access tokens on protected routes.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user.emailVerified) {
      throw new UnauthorizedException({
        message: 'Email not verified',
        errorCode: 'EMAIL_NOT_VERIFIED',
      });
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business?.id,
    };
  }
}
