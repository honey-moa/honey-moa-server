import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TokenController } from '@src/apis/token/controllers/token.controller';
import { JwtResponseDto } from '@src/libs/api/dtos/response/jwt.response-dto';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { TOKEN_ERROR_CODE } from '@src/libs/exceptions/types/errors/token/token-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import {
  ApiOperator,
  ApiOperationOptionsWithSummary,
} from '@src/libs/types/type';

export const ApiToken: ApiOperator<keyof Omit<TokenController, 'verifyEmail'>> =
  {
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
            code: TOKEN_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
            description: '이메일 또는 비밀번호가 잘못된 경우',
          },
        ]),
      );
    },
  };
