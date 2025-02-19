import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserConnectionController } from '@features/user/user-connection/controllers/user-connection.controller';
import { UserConnectionResponseDto } from '@features/user/user-connection/dtos/response/user-connection.response-dto';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';

import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { OffsetPaginationResponseDto } from '@libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';

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
          code: USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_MYSELF,
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
          code: USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED,
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
          code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION,
          description: '요청한 유저가 이미 커넥션이 맺어져 있음.',
        },
        {
          code: USER_CONNECTION_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION,
          description: '요청 받은 유저가 이미 커넥션이 맺어져 있음.',
        },
        {
          code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
          description:
            '요청한 유저는 이미 대기중인 커넥션 요청이 있음. 여러개의 요청 생성 불가.',
        },
      ]),
    );
  },

  FindConnections: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      OffsetPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'userConnections',
        UserConnectionResponseDto,
      ),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_JSON_FORMAT,
          description: '잘못된 json format',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description:
            'orderBy 값에 유효하지 않은 키 이거나 값의 포맷, enum이 잘못됨',
          customMessage:
            'Invalid value: a  sc for key: id. Allowed values are asc, desc',
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
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해서 발생하는 에러.',
        },
      ]),
    );
  },

  Update: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiNoContentResponse({
        description: '정상적으로 유저 커넥션 수락 / 거절 / 취소됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'userConnectionId가 양의 정수가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'id',
                value: 'asdf',
                reason: 'param internal the id must be a numeric string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'status가 ACCEPTED / REJECTED / CANCELED 중 하나가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'status',
                value: 'ACCEPTsED',
                reason:
                  'status must be one of the following values: ACCEPTED, REJECTED, CANCELED',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: COMMON_ERROR_CODE.PERMISSION_DENIED,
          description: '유저가 커넥션 요청자 혹은 피요청자가 아님.',
        },
        {
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_ACCEPT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
          description: '피요청자만 커넥션 요청을 수락할 수 있음.',
        },
        {
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_REJECT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
          description: '피요청자만 커넥션 요청을 거절할 수 있음.',
        },
        {
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_CANCEL_CONNECTION_REQUEST_THAT_YOU_SENT,
          description: '요청자만 커넥션 요청을 취소할 수 있음.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '커넥션이 존재하지 않음.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_UPDATE_PENDING_CONNECTION,
          description: 'pending 상태의 커넥션만 수정할 수 있음.',
        },
      ]),
    );
  },

  Disconnect: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiNoContentResponse({
        description: '정상적으로 유저 커넥션 해제됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'userConnectionId가 양의 정수가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'id',
                value: 'asdf',
                reason: 'param internal the id must be a numeric string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
          description: '유저가 커넥션 요청자 혹은 피요청자가 아님.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '커넥션이 존재하지 않음.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_DISCONNECT_CONNECTED_CONNECTION,
          description: 'connected 상태의 커넥션만 해제할 수 있음.',
        },
      ]),
    );
  },
};
