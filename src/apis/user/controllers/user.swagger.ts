import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { UserController } from '@src/apis/user/controllers/user.controller';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { CustomValidationError } from '@src/libs/types/custom-validation-errors.type';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiUser: ApiOperator<keyof UserController> = {
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
