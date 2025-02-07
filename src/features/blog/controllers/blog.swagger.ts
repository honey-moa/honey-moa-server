import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { BlogController } from '@features/blog/controllers/blog.controller';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';

import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { BLOG_ERROR_CODE } from '@libs/exceptions/types/errors/blog/blog-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';
import { BlogResponseDto } from '@features/blog/dtos/response/blog.response-dto';

export const ApiBlog: ApiOperator<keyof BlogController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description:
          'Mime-Type은 image/png, image/jpeg 타입만 허용됨.<br>' +
          '파일 크기는 10MB 까지만 허용됨.',
        schema: {
          type: 'object',
          required: ['name', 'description', 'dDayStartDate'],
          properties: {
            backgroundImageFile: {
              type: 'string',
              format: 'binary',
              nullable: true,
            },
            name: {
              description: '블로그 이름',
              type: 'string',
              minLength: 1,
              maxLength: 30,
            },
            description: {
              description: '블로그 설명',
              type: 'string',
              minLength: 1,
              maxLength: 255,
            },
            dDayStartDate: {
              description:
                '블로그 시작일. 시간 제외 날짜 값까지만 허용. ex)2025-02-06',
              type: 'string',
              format: 'date',
              maxLength: 10,
            },
          },
        },
      }),
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
          code: BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG,
          description: '유저가 이미 블로그를 가지고 있음.',
        },
      ]),
    );
  },

  FindOneByUserId: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiOkResponse({
        description: '정상적으로 블로그 조회됨.',
        type: BlogResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'userId가 numeric string이 아님',
          additionalErrors: {
            errors: [
              {
                value: '6741371996205169262ㅁㄴㅇㅁㄴㅇ',
                property: 'id',
                reason: 'param internal the id must be a numeric string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '블로그가 존재하지 않음.',
        },
      ]),
    );
  },
};
