import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import type { HttpExceptionService } from '@libs/exceptions/services/http-exception.service';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { HttpUnprocessableEntityException } from '@libs/exceptions/client-errors/exceptions/http-unprocessable-entity.exception';
import type { Response } from 'express';

type ClientErrorException =
  | HttpBadRequestException
  | HttpUnauthorizedException
  | HttpForbiddenException
  | HttpNotFoundException
  | HttpConflictException
  | HttpUnprocessableEntityException;

/**
 * 400번대 에러를 잡는 exception filter
 */
@Catch(
  HttpBadRequestException,
  HttpUnauthorizedException,
  HttpForbiddenException,
  HttpNotFoundException,
  HttpConflictException,
  HttpUnprocessableEntityException,
)
export class HttpClientErrorExceptionFilter
  implements ExceptionFilter<ClientErrorException>
{
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

  catch(exception: ClientErrorException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();
    const exceptionError = exception.getResponse();

    const responseJson = this.httpExceptionService.buildResponseJson(
      statusCode,
      exceptionError,
    );

    this.httpExceptionService.printLog({
      stack: exception.stack,
      request,
      response: {
        body: responseJson,
      },
    });

    response.status(statusCode).json(responseJson);
  }
}
