import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import { HttpError } from '@libs/exceptions/types/exceptions.type';

/**
 * status code 404 error exception
 */
export class HttpNotFoundException extends HttpException {
  constructor(error: HttpError<HttpNotFoundException>) {
    const { code, errors, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.NOT_FOUND,
      errors,
      customMessage,
    });
  }

  getResponse(): HttpNotFoundException {
    return super.getResponse() as HttpNotFoundException;
  }
}
