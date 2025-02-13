import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { GUARD_TYPE_TOKEN, GuardType } from '@libs/guards/types/guard.constant';
import { GuardTypeUnion } from '@libs/guards/types/guard.type';

export const User = createParamDecorator(
  (data: keyof Express.User | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!isNil(data)) {
      if (isNil(req.user?.[data])) {
        const reflector = new Reflector();

        const guardType = reflector.getAllAndOverride<
          GuardTypeUnion,
          typeof GUARD_TYPE_TOKEN
        >(GUARD_TYPE_TOKEN, [ctx.getHandler(), ctx.getClass()]);

        if (guardType === GuardType.OPTIONAL) {
          return null;
        }

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
