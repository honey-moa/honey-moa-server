import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UserController } from '@src/apis/user/controllers/user.controller';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiUser: ApiOperator<keyof Omit<UserController, 'verifyEmail'>> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiCreatedResponse({
        description: '정상적으로 회원가입 됨.',
        type: IdResponseDto,
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
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.ALREADY_CREATED_USER,
          description: '이미 존재하는 이메일입니다.',
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
      ApiOkResponse({
        description: '정상적으로 유저 상세 조회 됨.',
        type: UserResponseDto,
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
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '리소스를 찾을 수 없습니다.',
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
};
