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
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
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
      HttpInternalServerErrorException.swaggerBuilder(
        HttpStatus.INTERNAL_SERVER_ERROR,
        [
          {
            code: COMMON_ERROR_CODE.SERVER_ERROR,
            description: '서버 에러',
          },
        ],
      ),
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
      HttpInternalServerErrorException.swaggerBuilder(
        HttpStatus.INTERNAL_SERVER_ERROR,
        [
          {
            code: COMMON_ERROR_CODE.SERVER_ERROR,
            description: '서버 에러',
          },
        ],
      ),
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
      HttpInternalServerErrorException.swaggerBuilder(
        HttpStatus.INTERNAL_SERVER_ERROR,
        [
          {
            code: COMMON_ERROR_CODE.SERVER_ERROR,
            description: '서버 에러',
          },
        ],
      ),
    );
  },
};
