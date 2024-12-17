import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@src/libs/exceptions/http.exception';
import { HttpError } from '@src/libs/exceptions/types/exceptions.type';

/**
 * status code 409 error exception
 */
export class HttpConflictException extends HttpException {
  constructor(error: HttpError<HttpConflictException>) {
    const { code, errors } = error;

    super({
      code,
      statusCode: HttpStatus.CONFLICT,
      errors,
    });
  }

  getResponse(): HttpConflictException {
    return super.getResponse() as HttpConflictException;
  }
}
