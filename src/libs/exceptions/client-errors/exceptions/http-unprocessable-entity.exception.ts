import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import { HttpError } from '@libs/exceptions/types/exceptions.type';
/**
 * status code 422 error exception
 */
export class HttpUnprocessableEntityException extends HttpException {
  constructor(error: HttpError<HttpUnprocessableEntityException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpUnprocessableEntityException {
    return super.getResponse() as HttpUnprocessableEntityException;
  }
}
