import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { HttpStatus } from '@nestjs/common';

export const ApiInternalServerErrorBuilder = () => {
  return HttpInternalServerErrorException.swaggerBuilder(
    HttpStatus.INTERNAL_SERVER_ERROR,
    [
      {
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        description: '서버 내부에서 에러 발생. 백엔드 개발자에게 알려 주세요.',
      },
    ],
  );
};
