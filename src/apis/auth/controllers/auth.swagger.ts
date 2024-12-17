import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { AuthController } from '@src/apis/auth/controllers/auth.controller';
import { JwtResponseDto } from '@src/apis/auth/dtos/response/jwt.response-dto';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { AUTH_ERROR_CODE } from '@src/libs/exceptions/types/errors/auth/auth-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

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
        type: JwtResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(
        HttpStatus.BAD_REQUEST,
        [COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER],
        {
          description:
            '해당 필드는 request parameter 가 잘못된 경우에만 리턴됩니다.',
          type: CustomValidationError,
        },
      ),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        USER_ERROR_CODE.ALREADY_CREATED_USER,
      ]),
    );
  },

  SignIn: (
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
        COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        COMMON_ERROR_CODE.INVALID_TOKEN,
        AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
      ]),
    );
  },
};
