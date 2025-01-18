import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import { HttpError } from '@libs/exceptions/types/exceptions.type';

/**
 * status code 403 error exception
 */
export class HttpForbiddenException extends HttpException {
  constructor(error: HttpError<HttpForbiddenException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.FORBIDDEN,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpForbiddenException {
    return super.getResponse() as HttpForbiddenException;
  }
}
