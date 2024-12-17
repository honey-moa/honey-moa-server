import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';

import { Response } from 'express';

type ClientErrorException =
  | HttpBadRequestException
  | HttpUnauthorizedException
  | HttpForbiddenException
  | HttpNotFoundException
  | HttpConflictException;

/**
 * 400번대 에러를 잡는 exception filter
 */
@Catch(
  HttpBadRequestException,
  HttpUnauthorizedException,
  HttpForbiddenException,
  HttpNotFoundException,
  HttpConflictException,
)
export class HttpClientErrorExceptionFilter
  implements ExceptionFilter<ClientErrorException>
{
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

  catch(exception: ClientErrorException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = exception.getStatus();
    const exceptionError = exception.getResponse();

    const responseJson = this.httpExceptionService.buildResponseJson(
      statusCode,
      exceptionError,
    );

    response.status(statusCode).json(responseJson);
  }
}
