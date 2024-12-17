import { Inject, Injectable } from '@nestjs/common';
import { AppConfigServicePort } from '@src/libs/core/app-config/services/app-config.service-port';

import { APP_CONFIG_SERVICE_DI_TOKEN } from '@src/libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@src/libs/core/app-config/types/app-config.type';
import { ExceptionResponseDto } from '@src/libs/exceptions/dtos/exception-response.dto';
import { ERROR_CODE } from '@src/libs/exceptions/types/errors/error-code.constant';
import { ERROR_MESSAGE } from '@src/libs/exceptions/types/errors/error-message.constant';
import { ValueOf } from '@src/libs/types/type';

interface ExceptionError {
  code: ValueOf<typeof ERROR_CODE>;
  errors?: unknown[];
  stack?: any;
}

interface LogInfo {
  ctx: string;
  stack?: any;
  request: Partial<Request> & { user?: Record<string, any> };
  response: Partial<Omit<Response, 'body'>> & { body?: Record<any, any> };
}

@Injectable()
export class HttpExceptionService {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  buildResponseJson(
    statusCode: number,
    exceptionError: ExceptionError,
  ): ExceptionResponseDto {
    const isProduction = this.appConfigService.isProduction();
    const { code, errors } = exceptionError;

    return new ExceptionResponseDto({
      statusCode,
      code,
      message: ERROR_MESSAGE[code],
      errors: errors ?? [],
      stack:
        statusCode >= 500 && isProduction ? exceptionError.stack : undefined,
    });
  }

  printLog(logInfo: LogInfo): void {
    const { ctx, stack, request, response } = logInfo;

    console.error({
      ctx,
      stack,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        currentUser: request.user,
      },
      response: {
        body: Object.assign({}, response.body),
      },
    });
  }
}
