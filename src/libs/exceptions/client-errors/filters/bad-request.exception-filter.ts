import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getResponse<Request>();

    const originalResponse = exception.getResponse();

    const httpBadRequestException = new HttpBadRequestException({
      code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
      errors: [
        typeof originalResponse === 'string'
          ? originalResponse
          : originalResponse['message'],
      ],
    });

    const exceptionError = httpBadRequestException.getResponse();

    const responseJson = this.httpExceptionService.buildResponseJson(
      httpBadRequestException.getStatus(),
      exceptionError,
    );

    this.httpExceptionService.printLog({
      stack: exception.stack,
      request,
      response: {
        body: responseJson,
      },
    });

    response.status(HttpStatus.BAD_REQUEST).json(responseJson);
  }
}
