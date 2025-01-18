import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';

import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { HttpExceptionService } from '@libs/exceptions/services/http-exception.service';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { ZodError } from 'zod';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * ZodError를 잡는 ExceptionFilter
 */
@Catch(ZodError)
export class ZodErrorExceptionFilter implements ExceptionFilter<ZodError> {
  constructor(
    private readonly httpExceptionService: HttpExceptionService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  catch(exception: ZodError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    const httpInternalServerErrorException =
      new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'ZodError',
        stack: exception.stack,
      });

    const exceptionError = httpInternalServerErrorException.getResponse();

    const responseJson = this.httpExceptionService.buildResponseJson(
      statusCode,
      exceptionError,
    );

    this.logger.error(
      JSON.stringify(
        {
          ctx: exception.issues,
          stack: exception.stack,
          request: {
            method: request.method,
            url: request.url,
            body: request.body,
            currentUser: request.user?.sub,
          },
          response: {
            body: responseJson,
          },
        },
        null,
        2,
      ),
    );

    response.status(statusCode).json(responseJson);
  }
}
