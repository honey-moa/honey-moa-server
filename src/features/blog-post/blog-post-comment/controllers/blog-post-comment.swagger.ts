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
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';
import { BlogPostCommentController } from '@features/blog-post/blog-post-comment/controllers/blog-post-comment.controller';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { BlogPostCommentResponseDto } from '@features/blog-post/blog-post-comment/dtos/response/blog-post-comment.response-dto';
import { OffsetPaginationResponseDto } from '@libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';
import { CursorPaginationResponseDto } from '@libs/interceptors/pagination/dtos/cursor-pagination-interceptor.response-dto';
export const ApiBlogPostComment: ApiOperator<keyof BlogPostCommentController> =
  {
    Create: (
      apiOperationOptions: ApiOperationOptionsWithSummary,
    ): MethodDecorator => {
      return applyDecorators(
        ApiOperation({
          ...apiOperationOptions,
        }),
        ApiBearerAuth('access-token'),
        ApiCreatedResponse({
          description: '정상적으로 블로그 포스트 댓글 생성됨.',
          type: IdResponseDto,
        }),
        HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: 'blogPostId가 numeric string이 아님',
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
            description: 'content가 1이상 225이하의 문자열이어야 함.',
            additionalErrors: {
              errors: [
                {
                  property: 'content',
                  value: '',
                  reason:
                    'content must be longer than or equal to 1 characters',
                },
              ],
              errorType: CustomValidationError,
            },
          },
        ]),
        HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
          {
            code: COMMON_ERROR_CODE.INVALID_TOKEN,
            description: '유효하지 않은 토큰으로 인해 발생하는 에러.',
          },
        ]),
        HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
          {
            code: USER_ERROR_CODE.EMAIL_NOT_VERIFIED,
            description:
              '이메일이 인증되지 않은 유저가 댓글을 작성하려 하면 에러 발생.',
          },
          {
            code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
            description:
              '게시글이 private한 게시글일 경우 커넥션에 속해 있지 않으면 에러 발생.',
          },
        ]),
        HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
          {
            code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
            description: '게시글이 존재하지 않음.',
          },
        ]),
      );
    },

    FindBlogPostComments: (
      apiOperationOptions: ApiOperationOptionsWithSummary,
    ): MethodDecorator => {
      const paginationResponseTypes = [
        CursorPaginationResponseDto.swaggerBuilder(
          HttpStatus.OK,
          'blogPostComments',
          BlogPostCommentResponseDto,
          [{ format: 'int64', key: 'id' }],
          true,
        ),
        OffsetPaginationResponseDto.swaggerBuilder(
          HttpStatus.OK,
          'blogPostComments',
          BlogPostCommentResponseDto,
          true,
        ),
      ];

      return applyDecorators(
        ApiOperation({ ...apiOperationOptions }),
        ApiBearerAuth('access-token'),

        ApiExtraModels(...paginationResponseTypes),
        ApiOkResponse({
          description:
            '정상적으로 블로그 포스트 댓글 조회됨. cursor 혹은 pagination response 타입 중 하나를 리턴함.',
          schema: {
            oneOf: paginationResponseTypes.map((type) => ({
              $ref: getSchemaPath(type),
            })),
          },
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
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: '필수 key값 혹은 value의 format이 잘못됨.',
          },
          {
            code: COMMON_ERROR_CODE.INVALID_JSON_FORMAT,
            description: 'JSON format이 잘못됨.',
          },
        ]),
        HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
          {
            code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
            description:
              'private한 게시글 댓글 조회의 경우 커넥션에 속해 있지 않으면 에러 발생.',
          },
        ]),
        HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
          {
            code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
            description: '게시글이 존재하지 않음.',
          },
        ]),
      );
    },

    PatchUpdate: (
      apiOperationOptions: ApiOperationOptionsWithSummary,
    ): MethodDecorator => {
      return applyDecorators(
        ApiOperation({ ...apiOperationOptions }),
        ApiBearerAuth('access-token'),
        ApiNoContentResponse({
          description: '정상적으로 블로그 포스트 댓글 수정됨.',
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
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: 'blogPostComment의 id가 numeric string이 아님.',
            additionalErrors: {
              errors: [
                {
                  value: '6741371996205169262ㅁㄴㅇㅁㄴㅇ',
                  property: 'blogPostCommentId',
                  reason:
                    'param internal the blogPostCommentId must be a numeric string',
                },
              ],
              errorType: CustomValidationError,
            },
          },
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: 'content가 1이상 225이하의 문자열이어야 함.',
          },
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: 'Body에 적어도 하나의 키벨류는 존재해야 함.',
          },
        ]),
        HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
          {
            code: COMMON_ERROR_CODE.PERMISSION_DENIED,
            description: '블로그 포스트 댓글 수정 권한이 없음.',
          },
        ]),
        HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
          {
            code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
            description: '블로그 포스트 혹은 댓글이 존재하지 않음.',
          },
        ]),
      );
    },

    Delete: (
      apiOperationOptions: ApiOperationOptionsWithSummary,
    ): MethodDecorator => {
      return applyDecorators(
        ApiOperation({ ...apiOperationOptions }),
        ApiBearerAuth('access-token'),
        ApiNoContentResponse({
          description: '정상적으로 블로그 포스트 댓글 삭제됨.',
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
          {
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            description: 'blogPostComment의 id가 numeric string이 아님.',
            additionalErrors: {
              errors: [
                {
                  value: '6741371996205169262ㅁㄴㅇㅁㄴㅇ',
                  property: 'blogPostCommentId',
                  reason:
                    'param internal the blogPostCommentId must be a numeric string',
                },
              ],
              errorType: CustomValidationError,
            },
          },
        ]),
        HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
          {
            code: COMMON_ERROR_CODE.PERMISSION_DENIED,
            description: '블로그 포스트 댓글 삭제 권한이 없음.',
          },
        ]),
        HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
          {
            code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
            description: '블로그 포스트 혹은 댓글이 존재하지 않음.',
          },
        ]),
      );
    },
  };
