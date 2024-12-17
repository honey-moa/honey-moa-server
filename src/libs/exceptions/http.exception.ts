import {
  HttpException as NestHttpException,
  Type,
  applyDecorators,
} from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ERROR_CODE } from '@src/libs/exceptions/types/errors/error-code.constant';
import { ERROR_MESSAGE } from '@src/libs/exceptions/types/errors/error-message.constant';

import { HttpError } from '@src/libs/exceptions/types/exceptions.type';
import { ValueOf } from '@src/libs/types/type';

export class HttpException extends NestHttpException {
  public readonly statusCode: ErrorHttpStatusCode;

  public readonly code: ValueOf<typeof ERROR_CODE>;

  public readonly errors?: unknown[];

  constructor(
    error: HttpError<HttpException> & { statusCode: ErrorHttpStatusCode },
  ) {
    const { statusCode, code, errors } = error;

    super(
      {
        code,
        errors,
      },
      statusCode,
    );
  }

  static swaggerBuilder(
    status: ErrorHttpStatusCode,
    codes: ValueOf<typeof ERROR_CODE>[],
    errors?: { description: string; type: Type },
  ) {
    const ExtraModels: any[] = [];
    let errorsProperty: unknown;

    if (errors) {
      errorsProperty = {
        description: errors.description,
        type: 'array',
        items: {
          type: 'object',
          $ref: getSchemaPath(errors.type),
        },
      };

      ExtraModels.push(ApiExtraModels(errors.type));
    }

    return applyDecorators(
      ...ExtraModels,
      ApiResponse({
        status,
        schema: {
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '에러 발생 시각',
            },
            statusCode: {
              type: 'number',
              format: 'integer',
              description: 'http status code',
              minimum: 400,
              example: status,
            },
            code: {
              type: 'number',
              description: 'error code',
              example: codes[0],
              enum: codes,
            },
            message: {
              type: 'string',
              description: 'error message',
              example: ERROR_MESSAGE[ERROR_CODE[codes[0]]],
              enum: codes.map((code) => ERROR_MESSAGE[code]),
            },
            errors: errorsProperty as SchemaObject,
          },
        },
      }),
    );
  }
}
