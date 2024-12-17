import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@src/libs/exceptions/http.exception';
import { HttpError } from '@src/libs/exceptions/types/exceptions.type';
/**
 * status code 401 error exception
 */
export class HttpUnauthorizedException extends HttpException {
  constructor(error: HttpError<HttpUnauthorizedException>) {
    const { code, errors } = error;

    super({
      code,
      statusCode: HttpStatus.UNAUTHORIZED,
      errors,
    });
  }

  getResponse(): HttpUnauthorizedException {
    return super.getResponse() as HttpUnauthorizedException;
  }
}
