import { HttpStatus } from '@nestjs/common';

import { HttpException } from '@libs/exceptions/http.exception';
import { HttpError } from '@libs/exceptions/types/exceptions.type';

/**
 * customize status code 500 error exception
 */
export class HttpInternalServerErrorException extends HttpException {
  public readonly ctx: string;
  public readonly stack?: any;

  constructor(
    error: Omit<HttpError<HttpInternalServerErrorException>, 'message'> & {
      ctx: string;
      stack?: any;
    },
  ) {
    const { code, errors, ctx, stack, customMessage } = error;

    super({
      code,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errors,
      customMessage,
    });

    this.ctx = ctx;
    this.stack = stack;
  }

  getResponse(): HttpInternalServerErrorException {
    return {
      ...(super.getResponse() as any),
      ctx: this.ctx,
      stack: this.stack,
    } as HttpInternalServerErrorException;
  }
}
