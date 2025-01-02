import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@src/libs/utils/util';
import { Request } from 'express';

export const GetUserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();

  if (isNil(req.user)) {
    throw new HttpInternalServerErrorException({
      code: COMMON_ERROR_CODE.SERVER_ERROR,
      ctx: 'req 내에 user가 없음.',
    });
  }

  return BigInt(req.user.id);
});
