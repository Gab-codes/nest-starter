import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as Record<string, unknown>).message ??
          exceptionResponse);

    const logContext = {
      status,
      message: typeof message === 'string' ? message : 'Exception occurred',
      path: request.url,
      method: request.method,
      query: request.query,
      params: request.params,
      body: this.sanitizeBody(request.body),
      ip: request.ip || request.headers['x-forwarded-for'],
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
      // Include validation errors if present
      errors:
        exceptionResponse && typeof exceptionResponse === 'object'
          ? (exceptionResponse as Record<string, unknown>).errors
          : undefined,
    };

    if (status >= 500) {
      this.logger.error(
        {
          ...logContext,
          stack: exception instanceof Error ? exception.stack : undefined,
          exception:
            exception instanceof Error
              ? exception.constructor.name
              : typeof exception,
        },
        'Internal Server Error',
      );
    } else if (status >= 400) {
      // Client errors - still log but with warning level
      this.logger.warn(logContext, `Client Error: ${status}`);
    } else {
      // Other errors (shouldn't happen but just in case)
      this.logger.info(logContext, 'Non-error exception caught');
    }

    // Send response (unchanged from your version)
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Optionally include validation errors in development
      ...(process.env.NODE_ENV === 'development' &&
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'errors' in exceptionResponse && {
          errors: (exceptionResponse as Record<string, unknown>).errors,
        }),
    });
  }

  // Sanitize sensitive data from logs
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'token',
      'verificationToken',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
