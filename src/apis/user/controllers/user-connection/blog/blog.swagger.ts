import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { BlogController } from '@src/apis/user/controllers/user-connection/blog/blog.controller';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';

import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { BLOG_ERROR_CODE } from '@src/libs/exceptions/types/errors/blog/blog-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@src/libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiBlog: ApiOperator<keyof BlogController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiCreatedResponse({
        description: '정상적으로 블로그 생성됨.',
        type: IdResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'name의 길이가 1 이상 30 이하가 아님.',
          additionalErrors: {
            errors: [
              {
                property: 'name',
                value: 1,
                reason:
                  'name must be longer than or equal to 1 and shorter than or equal to 30 characters',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'connectionId가 number string이 아님',
          additionalErrors: {
            errors: [
              {
                property: 'connectionId',
                value: 'asdf',
                reason: 'connectionId must be a number string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
          description: '유저가 맺어진 커넥션이 없음.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '유저 혹은 커넥션이 존재하지 않음.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG,
          description: '유저가 이미 블로그를 가지고 있음.',
        },
      ]),
    );
  },
};
