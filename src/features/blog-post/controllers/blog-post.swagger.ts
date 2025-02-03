import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';

import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';
import { BlogPostController } from '@features/blog-post/controllers/blog-post.controller';
import { BlogPostResponseDto } from '@features/blog-post/dtos/response/blog-post.response-dto';

export const ApiBlogPost: ApiOperator<keyof BlogPostController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
        summary: '블로그 포스트 생성',
      }),
      ApiBearerAuth('access-token'),
      ApiCreatedResponse({
        description: '정상적으로 블로그 게시글 생성됨.',
        type: IdResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'tagNames가 중복됨.',
          additionalErrors: {
            errors: [
              {
                property: 'tagNames',
                value: ['abc', 'abc'],
                reason: "All tagNames's elements must be unique",
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'tagNames의 요소가 1 이상 20 이하가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'tagNames',
                value: ['', 'abc'],
                reason:
                  'each value in tagNames must be longer than or equal to 1 and shorter than or equal to 20 characters',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'location이 1 이상 100 이하가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'location',
                value: '',
                reason: 'location must be longer than or equal to 1 characters',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'title이 1 이상 255 이하가 아님',
          additionalErrors: {
            errors: [
              {
                property: 'title',
                value: '',
                reason: 'title must be longer than or equal to 1 characters',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'date가 date format이 아님',
          additionalErrors: {
            errors: [
              {
                property: 'date',
                value: '2025-0122',
                reason: 'date must be a valid ISO 8601 date string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '그 외 기타 등등 많음',
          additionalErrors: {
            errors: [
              {
                property: 'contents',
                value: [],
                reason: 'contents should not be empty',
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
          code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
          description: '해당 blog의 커넥션에 속해있지 않음.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '해당 blog가 존재하지 않음.',
        },
      ]),
    );
  },

  FindOne: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiOkResponse({
        description:
          '정상적으로 블로그 게시글 상세 조회 됨.<br>' +
          '해당 API의 response에선 optional 필드 중 tags만 return 됨',
        type: BlogPostResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'blogPost의 id가 numeric string이 아님.',
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
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해서 발생하는 에러.',
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: COMMON_ERROR_CODE.PERMISSION_DENIED,
          description:
            '비공개 게시글의 경우 커넥션에 속해 있지 않으면 403 에러 처리',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '해당 blogPost가 존재하지 않음.',
        },
      ]),
    );
  },
};
