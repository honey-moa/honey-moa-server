import {
  HttpException as NestHttpException,
  Type,
  applyDecorators,
} from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ExampleObject,
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
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
    codeAndDescription: {
      description: string;
      code: ValueOf<typeof ERROR_CODE>;
      additionalErrors?: {
        errors: Array<
          { value: unknown; reason: string; property: string } | string
        >;
        errorType: Type;
      };
    }[] = [
      {
        description: '에러가 발생한 이유',
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      },
    ],
  ) {
    const timestamp = new Date().toISOString();

    const examples = codeAndDescription.reduce<
      Record<string, Pick<ExampleObject, 'value' | 'description'>>
    >((acc, { description, additionalErrors, code }) => {
      acc[description] = {
        description,
        value: {
          timestamp,
          status,
          code,
          message: ERROR_MESSAGE[code],
        },
      };

      if (additionalErrors) {
        acc[description].value.errors = additionalErrors.errors;
      }

      return acc;
    }, {});

    let errorsProperty: SchemaObject | undefined = undefined;

    const hasAdditionalErrors = codeAndDescription.some(
      ({ additionalErrors }) => additionalErrors,
    );

    const ExtraModels: any[] = [];

    if (hasAdditionalErrors) {
      const oneOf: (SchemaObject | ReferenceObject)[] = [];

      codeAndDescription.forEach(({ additionalErrors }) => {
        if (!additionalErrors) {
          return;
        }
        oneOf.push({ $ref: getSchemaPath(additionalErrors.errorType) });
        ExtraModels.push(ApiExtraModels(additionalErrors.errorType));
      });

      errorsProperty = {
        description: '에러 목록',
        type: 'array',
        items: {
          oneOf,
        },
      };
    }

    const content = {
      'application/json': {
        schema: {
          required: hasAdditionalErrors
            ? ['timestamp', 'statusCode', 'code', 'message']
            : undefined,
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '에러 발생 시각',
              example: timestamp,
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
              example: codeAndDescription[0].code,
              enum: codeAndDescription.map(({ code }) => code),
            },
            message: {
              type: 'string',
              description: 'error message',
              example: ERROR_MESSAGE[ERROR_CODE[codeAndDescription[0].code]],
              enum: codeAndDescription.map(({ code }) => ERROR_MESSAGE[code]),
            },
          },
        },
        examples,
      },
    };

    if (hasAdditionalErrors) {
      content['application/json'].schema.properties['errors'] = errorsProperty;
    }

    return applyDecorators(
      ...ExtraModels,
      ApiResponse({
        status,
        content,
      }),
    );
  }
}
