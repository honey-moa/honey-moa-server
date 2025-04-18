import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestResponseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = new Date().getTime();

    return next.handle().pipe(
      map((data: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();

        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const endTime = new Date().getTime();
        const duration = `${endTime - startTime}ms`;

        const loggingObject: Record<string, any> = {
          duration,
          request: {
            method: method,
            url: originalUrl,
            currentUser: request.user?.sub,
            userAgent,
            ip,
            body: request.body,
          },
          response: {
            statusCode,
            contentLength,
            body: data,
          },
        };

        for (const key in loggingObject.request.body) {
          if (loggingObject.request.body[key]?.buffer) {
            loggingObject.request.body[key] = {
              ...loggingObject.request.body[key],
              buffer: undefined,
            };
          }

          if (Array.isArray(loggingObject.request.body[key])) {
            loggingObject.request.body[key] = loggingObject.request.body[
              key
            ].map((value) => {
              if (value.buffer) {
                return { ...value, buffer: undefined };
              }

              return value;
            });
          }
        }

        this.logger.log(JSON.stringify(loggingObject, null, 2));

        return data;
      }),
    );
  }
}
