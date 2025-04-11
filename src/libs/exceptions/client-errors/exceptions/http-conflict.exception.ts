import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import type { HttpError } from '@libs/exceptions/types/exceptions.type';

/**
 * status code 409 error exception
 */
export class HttpConflictException extends HttpException {
  constructor(error: HttpError<HttpConflictException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.CONFLICT,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpConflictException {
    return super.getResponse() as HttpConflictException;
  }
}
