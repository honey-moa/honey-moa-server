import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { GUARD_TYPE_TOKEN, GuardType } from '@libs/guards/types/guard.constant';
import { GuardTypeUnion } from '@libs/guards/types/guard.type';
import { Observable } from 'rxjs';

@Injectable()
export class JwtBearerAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const guardType = this.reflector.getAllAndOverride<
      GuardTypeUnion,
      typeof GUARD_TYPE_TOKEN
    >(GUARD_TYPE_TOKEN, [context.getHandler(), context.getClass()]);

    if (guardType === GuardType.PUBLIC || guardType === GuardType.BASIC) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<JwtPayload>(err, payload: JwtPayload) {
    if (err || !payload) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    return payload;
  }
}
