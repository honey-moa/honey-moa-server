import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { ZodError } from 'zod';
import { Request, Response } from 'express';

/**
 * ZodError를 잡는 ExceptionFilter
 */
@Catch(ZodError)
export class ZodErrorExceptionFilter implements ExceptionFilter<ZodError> {
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

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

    console.dir(
      {
        ctx: exception.issues,
        stack: exception.stack,
        request: {
          method: request.method,
          url: request.url,
          body: request.body,
          currentUser: request.user?.id,
        },
        response: {
          body: responseJson,
        },
      },
      { depth: null },
    );

    response.status(statusCode).json(responseJson);
  }
}
