import type { AuthController } from '@features/auth/controllers/auth.controller';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { JwtResponseDto } from '@libs/api/dtos/response/jwt.response-dto';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { AUTH_ERROR_CODE } from '@libs/exceptions/types/errors/auth/auth-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import type {
  ApiOperationOptionsWithSummary,
  ApiOperator,
} from '@libs/types/type';
import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ApiAuth: ApiOperator<keyof AuthController> = {
  SignUp: (
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

  Generate: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBasicAuth(),
      ApiCreatedResponse({
        description: '정상적으로 로그인 됨.',
        type: JwtResponseDto,
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '필드가 잘못된 경우',
        },
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
        {
          code: AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
          description: '이메일 또는 비밀번호가 잘못된 경우',
        },
      ]),
    );
  },

  GenerateAccessToken: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('refresh-token'),
      ApiCreatedResponse({
        description: '정상적으로 액세스 토큰이 재발급 됨.',
        example: {
          accessToken: 'string',
        },
      }),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
    );
  },
};
