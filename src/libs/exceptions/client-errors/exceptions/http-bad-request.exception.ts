import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@src/libs/exceptions/http.exception';
import { HttpError } from '@src/libs/exceptions/types/exceptions.type';

/**
 * status code 400 error exception
 */
export class HttpBadRequestException extends HttpException {
  constructor(error: HttpError<HttpBadRequestException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.BAD_REQUEST,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpBadRequestException {
    return super.getResponse() as HttpBadRequestException;
  }
}
