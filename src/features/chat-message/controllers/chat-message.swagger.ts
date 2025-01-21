import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';
import { ChatMessageController } from '@features/chat-message/controllers/chat-message.controller';
import { CursorPaginationResponseDto } from '@libs/interceptors/pagination/dtos/cursor-pagination-interceptor.response-dto';
import { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';
import { OffsetPaginationResponseDto } from '@libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';

export const ApiChatMessage: ApiOperator<keyof ChatMessageController> = {
  FindChatMessages: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    const paginationResponseTypes = [
      CursorPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'chatMessages',
        ChatMessageResponseDto,
        [
          { format: 'int64', key: 'id' },
          { format: 'date-time', key: 'createdAt' },
          { format: 'date-time', key: 'updatedAt' },
        ],
        true,
      ),
      OffsetPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'chatMessages',
        ChatMessageResponseDto,
        true,
      ),
    ];

    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiExtraModels(...paginationResponseTypes),
      ApiOkResponse({
        description:
          '정상적으로 채팅 메시지 조회 됨. cursor 혹은 offset pagination response 타입 중 하나를 리턴함.',
        schema: {
          oneOf: paginationResponseTypes.map((type) => ({
            $ref: getSchemaPath(type),
          })),
        },
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description:
            '해당 필드는 request parameter 가 잘못된 경우에만 리턴됩니다.',
          additionalErrors: {
            errors: [
              {
                reason: 'reason',
                property: 'property',
                value: 'value',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '필수 key값 혹은 value의 format이 잘못됨.',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_JSON_FORMAT,
          description: 'JSON format이 잘못됨.',
        },
      ]),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
    );
  },
};
