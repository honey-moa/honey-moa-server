import type { ChatRoomController } from '@features/chat-room/controllers/chat-room.controller';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ChatRoomResponseDto } from '@features/chat-room/dtos/response/chat-room.response-dto';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { CHAT_ROOM_ERROR_CODE } from '@libs/exceptions/types/errors/chat-room/chat-room-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import type {
  ApiOperationOptionsWithSummary,
  ApiOperator,
} from '@libs/types/type';

export const ApiChatRoom: ApiOperator<keyof ChatRoomController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiCreatedResponse({
        description: '정상적으로 채팅방 생성됨.',
        type: IdResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
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
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해서 발생하는 에러.',
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
          code: CHAT_ROOM_ERROR_CODE.YOU_ALREADY_HAVE_A_CHAT_ROOM,
          description: '유저가 이미 채팅방을 가지고 있음.',
        },
      ]),
    );
  },

  FindMyChatRoom: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiOkResponse({
        description: '정상적으로 채팅방 조회됨.',
        type: ChatRoomResponseDto,
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해서 발생하는 에러.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '채팅방을 찾을 수 없음.',
        },
      ]),
    );
  },
};
