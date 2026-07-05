import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Ensures the authenticated user owns the business associated with a resource.
 * Applied on business-scoped routes in feature modules (Phase 3+).
 */
@Injectable()
export class BusinessOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params?: { businessId?: string };
      body?: { businessId?: string };
    }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        message: 'Authentication required',
        errorCode: 'FORBIDDEN',
      });
    }

    if (user.role === 'admin') {
      return true;
    }

    const requestedBusinessId =
      request.params?.businessId ?? request.body?.businessId ?? user.businessId;

    if (!requestedBusinessId || requestedBusinessId !== user.businessId) {
      throw new ForbiddenException({
        message: 'Access denied to this business resource',
        errorCode: 'BUSINESS_ACCESS_DENIED',
      });
    }

    return true;
  }
}
