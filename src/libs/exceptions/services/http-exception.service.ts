import type { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Inject, Injectable, type Logger } from '@nestjs/common';

import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import type { Key } from '@libs/core/app-config/types/app-config.type';
import { ExceptionResponseDto } from '@libs/exceptions/dtos/exception-response.dto';
import type { ERROR_CODE } from '@libs/exceptions/types/errors/error-code.constant';
import { ERROR_MESSAGE } from '@libs/exceptions/types/errors/error-message.constant';
import type { ValueOf } from '@libs/types/type';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

interface ExceptionError {
  code: ValueOf<typeof ERROR_CODE>;
  errors?: unknown[];
  stack?: any;
  customMessage?: string;
}

interface LogInfo {
  ctx?: string;
  stack?: any;
  request: Partial<Request> & {
    user?: Record<string, any>;
  };
  response: Partial<Omit<Response, 'body'>> & { body?: Record<any, any> };
}

@Injectable()
export class HttpExceptionService {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  buildResponseJson(
    statusCode: number,
    exceptionError: ExceptionError,
  ): ExceptionResponseDto {
    const isProduction = this.appConfigService.isProduction();
    const { code, errors, customMessage } = exceptionError;

    return new ExceptionResponseDto({
      statusCode,
      code,
      message: customMessage ?? ERROR_MESSAGE[code],
      errors: errors ?? [],
      stack:
        statusCode >= 500 && isProduction ? exceptionError.stack : undefined,
    });
  }

  printLog(logInfo: LogInfo): void {
    const { ctx, stack, request, response } = logInfo;

    const loggingObject: Record<string, any> = {
      ctx,
      stack,
      request: {
        method: request.method,
        url: request.url,
        currentUser: request.user?.id,
        body: request.body,
      },
      response: {
        body: Object.assign({}, response.body),
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
        loggingObject.request.body[key] = loggingObject.request.body[key].map(
          (value) => {
            if (value.buffer) {
              return { ...value, buffer: undefined };
            }

            return value;
          },
        );
      }
    }

    this.logger.error(JSON.stringify(loggingObject, null, 2));
  }
}
