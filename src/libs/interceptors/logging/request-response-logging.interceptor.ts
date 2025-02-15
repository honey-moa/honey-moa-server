import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MemoryStoredFile } from 'nestjs-form-data';

import { Observable } from 'rxjs';
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
          },
          response: {
            statusCode,
            contentLength,
            body: data,
          },
        };

        if (request.body instanceof Array) {
          loggingObject.request.body = request.body.map((value) => {
            if (value instanceof MemoryStoredFile) {
              return { ...value, buffer: undefined };
            }
            return value;
          });
        } else if (request.body instanceof MemoryStoredFile) {
          loggingObject.request.body = { ...request.body, buffer: undefined };
        }

        this.logger.log(JSON.stringify(loggingObject, null, 2));

        return data;
      }),
    );
  }
}
