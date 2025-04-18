import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

import { UserController } from '@features/user/controllers/user.controller';
import { UserResponseDto } from '@features/user/dtos/response/user.response-dto';
import { UserMbti } from '@features/user/types/user.constant';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { CursorPaginationResponseDto } from '@libs/interceptors/pagination/dtos/cursor-pagination-interceptor.response-dto';
import { OffsetPaginationResponseDto } from '@libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperationOptionsWithSummary, ApiOperator } from '@libs/types/type';

export const ApiUser: ApiOperator<keyof Omit<UserController, 'verifyEmail'>> = {
  FindUsers: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    const paginationResponseTypes = [
      CursorPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'users',
        UserResponseDto,
        [
          { format: 'int64', key: 'id' },
          { format: 'date-time', key: 'createdAt' },
          { format: 'date-time', key: 'updatedAt' },
        ],
        true,
      ),
      OffsetPaginationResponseDto.swaggerBuilder(
        HttpStatus.OK,
        'users',
        UserResponseDto,
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
          '정상적으로 유저 조회 됨. cursor 혹은 offset pagination response 타입 중 하나를 리턴함.',
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

  FindMe: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiOkResponse({
        description:
          '정상적으로 내 유저 정보 조회 됨. blog, chatRoom 관련한 정보 없이 connection에 대한 정보만 나감',
        type: UserResponseDto,
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '유저를 찾을 수 없는 경우.',
        },
      ]),
    );
  },

  SendPasswordChangeVerificationEmail: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiNoContentResponse({
        description: '정상적으로 비밀번호 변경 인증 이메일 전송됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'Request parameter가 유효하지 않음',
          additionalErrors: {
            errors: [
              {
                property: 'connectUrl',
                value: 'http://localhost:3000.com',
                reason: 'connectUrl must be a URL address',
              },
              {
                value: 'jjb26com',
                property: 'email',
                reason: 'param internal the email must be a email format',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '리소스를 찾을 수 없습니다.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.CANNOT_RESEND_PASSWORD_CHANGE_VERIFICATION_EMAIL_AN_HOUR,
          description:
            '비밀번호 변경 인증 이메일이 재전송된 지 1시간이 지나지 않음.',
        },
      ]),
    );
  },

  UpdatePassword: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiNoContentResponse({
        description: '정상적으로 비밀번호 변경 완료됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'id가 양의 정수가 아님',
          additionalErrors: {
            errors: [
              {
                value: '뮨ㅁㅇㅍㄴㅁㅇ',
                property: 'id',
                reason: 'param internal the id must be a numeric string',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '패스워드가 정규식을 통과하지 못함',
          additionalErrors: {
            errors: [
              {
                property: 'newPassword',
                value: 'casd!',
                reason:
                  'newPassword must match /^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$/ regular expression',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'token이 uuid가 아님',
          additionalErrors: {
            errors: ['Validation failed (uuid is expected)'],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: USER_ERROR_CODE.INVALID_PASSWORD_CHANGE_VERIFY_TOKEN,
          description: '유효하지 않은 토큰을 보냈거나 만료된 토큰임.',
        },
      ]),
      HttpForbiddenException.swaggerBuilder(HttpStatus.FORBIDDEN, [
        {
          code: COMMON_ERROR_CODE.PERMISSION_DENIED,
          description:
            '인증 토큰이 생성되지 않았는데 해당 API에 접근함. 비정상적인 접근',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '리소스를 찾을 수 없습니다.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.ALREADY_USED_PASSWORD_CHANGE_VERIFY_TOKEN,
          description: '이미 사용된 인증 토큰.',
        },
      ]),
    );
  },

  SendVerificationEmail: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiNoContentResponse({
        description: '정상적으로 인증 이메일 전송됨.',
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '리소스를 찾을 수 없습니다.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.ALREADY_VERIFIED_EMAIL,
          description: '이미 인증된 이메일입니다.',
        },
        {
          code: USER_ERROR_CODE.CANNOT_RESEND_VERIFICATION_EMAIL_AN_HOUR,
          description: '인증 이메일 재전송 불가',
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
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description:
          'Mime-Type은 image/png, image/jpeg 타입만 허용됨.<br>' +
          '파일 크기는 10MB 까지만 허용됨.',
        schema: {
          type: 'object',
          properties: {
            profileImageFile: {
              type: 'string',
              format: 'binary',
              nullable: true,
              description:
                '유저 프로필 이미지 파일. empty string을 보낼 경우 null로 판단해 프로필 이미지를 아예 삭제함.',
            },
            nickname: {
              description: '유저 닉네임',
              type: 'string',
              minLength: 1,
              maxLength: 20,
            },
            mbti: {
              description: '유저 MBTI',
              type: 'string',
              enum: Object.values(UserMbti),
            },
          },
        },
      }),
      ApiNoContentResponse({
        description: '정상적으로 유저 정보 수정됨.',
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'Request parameter가 유효하지 않음',
          additionalErrors: {
            errors: [
              {
                property: 'nickname',
                value: 'qwdqwdqwasdasdasdasdasdasdasdasdasdadas',
                reason:
                  'nickname must be shorter than or equal to 20 characters',
              },
              {
                property: 'mbti',
                value: 'mbti',
                reason:
                  'mbti must be one of the following values: ENFP, ENFJ, INFP, INFJ, INTJ, ISTJ, ISFJ, ISFP, ESTP, ESTJ, ESFP, ESFJ, INTP, INFJ, INTJ, ISTJ, ISFJ, ISFP, ESTP, ESTJ, ESFP, ESFJ',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'Body에 적어도 하나의 키벨류는 존재해야 함.',
        },
      ]),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '유저를 찾을 수 없습니다.',
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
        description: '정상적으로 유저 삭제됨.',
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '유저를 찾을 수 없습니다.',
        },
      ]),
    );
  },
};
