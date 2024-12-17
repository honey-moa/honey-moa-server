import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@src/libs/exceptions/http.exception';
import { HttpError } from '@src/libs/exceptions/types/exceptions.type';

/**
 * status code 403 error exception
 */
export class HttpForbiddenException extends HttpException {
  constructor(error: HttpError<HttpForbiddenException>) {
    const { code, errors } = error;

    super({
      code,
      statusCode: HttpStatus.FORBIDDEN,
      errors,
    });
  }

  getResponse(): HttpForbiddenException {
    return super.getResponse() as HttpForbiddenException;
  }
}
