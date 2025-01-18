import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: keyof Express.User | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!isNil(data)) {
      if (isNil(req.user?.[data])) {
        throw new HttpInternalServerErrorException({
          code: COMMON_ERROR_CODE.SERVER_ERROR,
          ctx: `req.user 내에 ${data}가 없음.`,
        });
      }

      return data === 'sub' ? BigInt(req.user?.[data]) : req.user[data];
    }

    return req.user;
  },
);
