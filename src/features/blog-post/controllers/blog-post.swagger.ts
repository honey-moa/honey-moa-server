import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
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
import { CursorPaginationResponseDto } from '@libs/interceptors/pagination/dtos/cursor-pagination-interceptor.response-dto';
import { OffsetPaginationResponseDto } from '@libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';

export const ApiBlogPost: ApiOperator<keyof BlogPostController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
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

  PatchUpdate: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiNoContentResponse({
        description: '정상적으로 블로그 게시글 수정됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'blogPost나 blog의 id가 numeric string이 아님.',
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
          description: 'Body에 적어도 하나의 키벨류는 존재해야 함.',
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
          description: '해당 blog가 존재하지 않거나 게시글이 존재하지 않음.',
        },
      ]),
    );
  },

  FindBlogPostsFromBlog: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    const paginationResponseTypes = [
      CursorPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'blogPosts',
        BlogPostResponseDto,
        [
          { format: 'int64', key: 'id' },
          { format: 'date-time', key: 'createdAt' },
          { format: 'date-time', key: 'updatedAt' },
        ],
        true,
      ),
      OffsetPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'blogPosts',
        BlogPostResponseDto,
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
          '정상적으로 블로그 게시글 조회 됨. cursor 혹은 offset pagination response 타입 중 하나를 리턴함.',
        schema: {
          oneOf: paginationResponseTypes.map((type) => ({
            $ref: getSchemaPath(type),
          })),
        },
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'blog의 id가 numeric string이 아님.',
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
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '필수 key값 혹은 value의 format이 잘못됨.',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_JSON_FORMAT,
          description: 'JSON format이 잘못됨.',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'datePeriod가 date format이 아님',
          customMessage: "datePeriod isn't valid date format.",
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
          description:
            '해당 blog의 커넥션에 속해있지 않은데 private post에 접근하려 함.',
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
          code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
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

  FindPublicBlogPosts: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    const paginationResponseTypes = [
      CursorPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'blogPosts',
        BlogPostResponseDto,
        [
          { format: 'int64', key: 'id' },
          { format: 'date-time', key: 'createdAt' },
          { format: 'date-time', key: 'updatedAt' },
        ],
        true,
      ),
      OffsetPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'blogPosts',
        BlogPostResponseDto,
        true,
      ),
    ];

    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiExtraModels(...paginationResponseTypes),
      ApiOkResponse({
        description:
          '정상적으로 블로그 게시글 목록 조회 됨.<br>' +
          'cursor 혹은 offset pagination response 타입 중 하나를 리턴함.',
        schema: {
          oneOf: paginationResponseTypes.map((type) => ({
            $ref: getSchemaPath(type),
          })),
        },
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'title이 1 이상 255 이하가 아님.',
          additionalErrors: {
            errors: [
              {
                value: '',
                property: 'title',
                reason:
                  'title must be longer than or equal to 1 and shorter than or equal to 255 characters',
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
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '그 외 기타 등등 많음',
        },
      ]),
    );
  },

  Delete: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiNoContentResponse({
        description: '정상적으로 블로그 게시글 삭제됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'blogPost 혹은 blog의 id가 numeric string이 아님.',
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
          code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
          description: '커넥션에 속해있지 않음.',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '해당 blogPost 혹은 blog가 존재하지 않음.',
        },
      ]),
    );
  },
};
