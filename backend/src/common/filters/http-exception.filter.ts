import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Standard API error shape consumed by the frontend for i18n mapping.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
  path: string;
}

/**
 * Global exception filter producing consistent JSON error responses.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let errors: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        message = (body.message as string) || message;
        errorCode = (body.errorCode as string) || this.mapStatusToErrorCode(status);

        if (Array.isArray(body.message)) {
          errors = body.message.map((msg: string) => ({
            field: 'unknown',
            message: msg,
          }));
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        }
      } else {
        errorCode = this.mapStatusToErrorCode(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message,
      errorCode,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private mapStatusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'RATE_LIMIT_EXCEEDED',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
