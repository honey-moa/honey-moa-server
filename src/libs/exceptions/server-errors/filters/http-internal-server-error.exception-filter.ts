import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';

/**
 * nestJS 메서드를 이용한 500번 에러 를 잡는 exception filter
 * ex) throw new InternalServerErrorException()
 */
@Catch(HttpInternalServerErrorException)
export class HttpInternalServerErrorExceptionFilter
  implements ExceptionFilter<HttpInternalServerErrorException>
{
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

  catch(
    exception: HttpInternalServerErrorException,
    host: ArgumentsHost,
  ): void {
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
      ctx: exception.ctx,
      stack: exception.stack,
      request,
      response: {
        body: responseJson,
      },
    });

    response.status(statusCode).json(responseJson);
  }
}
