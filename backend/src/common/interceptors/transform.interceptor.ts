import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Wraps successful responses in a consistent envelope for list/detail endpoints.
 * Health and auth token endpoints bypass wrapping via @SkipTransform() in Phase 3.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return { data: null };
        }
        if (typeof data === 'object' && data !== null && 'data' in data) {
          return data;
        }
        return { data };
      }),
    );
  }
}
