import { ERROR_CODE } from '@libs/exceptions/types/errors/error-code.constant';
import { ERROR_MESSAGE } from '@libs/exceptions/types/errors/error-message.constant';
import { ValueOf } from '@libs/types/type';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export class ExceptionResponseDto {
  public readonly timestamp: Date;

  public readonly statusCode: ErrorHttpStatusCode;

  public readonly code: ValueOf<typeof ERROR_CODE>;

  public readonly message: ValueOf<typeof ERROR_MESSAGE>;

  public readonly stack?: any;

  public readonly errors: unknown[];

  constructor(error: Omit<ExceptionResponseDto, 'timestamp'>) {
    const { statusCode, code, message, stack, errors } = error;

    this.timestamp = new Date();
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
    this.stack = stack;
    this.errors = errors;
  }
}
