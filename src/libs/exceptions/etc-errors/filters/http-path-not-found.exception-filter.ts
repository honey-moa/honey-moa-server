import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';

import { Response } from 'express';

import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';

/**
 * api not found 에러를 잡는 필터
 */
@Catch(NotFoundException)
export class HttpPathNotFoundExceptionFilter
  implements ExceptionFilter<NotFoundException>
{
  constructor(private readonly httpExceptionService: HttpExceptionService) {}

  catch(exception: NotFoundException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();
    const exceptionError = {
      code: COMMON_ERROR_CODE.API_NOT_FOUND,
    };

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
