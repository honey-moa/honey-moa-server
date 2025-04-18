import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import { HttpError } from '@libs/exceptions/types/exceptions.type';
/**
 * status code 401 error exception
 */
export class HttpUnauthorizedException extends HttpException {
  constructor(error: HttpError<HttpUnauthorizedException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.UNAUTHORIZED,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpUnauthorizedException {
    return super.getResponse() as HttpUnauthorizedException;
  }
}
