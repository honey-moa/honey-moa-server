import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UserController } from '@src/apis/user/controllers/user.controller';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiUser: ApiOperator<keyof UserController> = {
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
      HttpBadRequestException.swaggerBuilder(
        HttpStatus.BAD_REQUEST,
        [COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER],
        {
          description:
            '해당 필드는 request parameter 가 잘못된 경우에만 리턴됩니다.',
          type: CustomValidationError,
        },
      ),
      HttpNotFoundException.swaggerBuilder(
        HttpStatus.NOT_FOUND,
        [COMMON_ERROR_CODE.RESOURCE_NOT_FOUND],
        {
          description: '해당 ID의 유저를 조회하지 못함.',
          type: CustomValidationError,
        },
      ),
    );
  },
};
