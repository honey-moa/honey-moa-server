import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserConnectionController } from '@src/apis/user/controllers/user-connection/user-connection.controller';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';

import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiUserConnection: ApiOperator<keyof UserConnectionController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiCreatedResponse({
        description: '정상적으로 유저 커넥션 생성됨.',
        type: IdResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: USER_ERROR_CODE.CANNOT_CREATE_CONNECTION_MYSELF,
          description: '본인 스스로 커넥션을 생성할 수 없음.',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'requestedId가 number string이 아님',
          additionalErrors: {
            errors: [
              {
                property: 'requestedId',
                value: 'asdf',
                reason: 'requestedId must be a number string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'requestedId가 양의 정수여야 함.',
          additionalErrors: {
            errors: [
              {
                property: 'requestedId',
                value: '-1',
                reason: 'requestedId must be greater than 1',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: USER_ERROR_CODE.EMAIL_NOT_VERIFIED,
          description: '커넥션 요청한 유저의 이메일이 인증되지 않음.',
          customMessage: 'The requester email is not verified.',
        },
        {
          code: USER_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED,
          description: '커넥션 요청 받은 유저의 이메일이 인증되지 않음.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '유저가 존재하지 않음.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION,
          description: '요청한 유저가 이미 커넥션이 맺어져 있음.',
        },
        {
          code: USER_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION,
          description: '요청 받은 유저가 이미 커넥션이 맺어져 있음.',
        },
        {
          code: USER_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
          description:
            '요청한 유저는 이미 대기중인 커넥션 요청이 있음. 여러개의 요청 생성 불가.',
        },
      ]),
    );
  },
};
