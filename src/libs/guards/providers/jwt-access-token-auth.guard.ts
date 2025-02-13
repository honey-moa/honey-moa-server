import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { GUARD_TYPE_TOKEN, GuardType } from '@libs/guards/types/guard.constant';
import { GuardTypeUnion } from '@libs/guards/types/guard.type';
import { Observable } from 'rxjs';
import { TokenType } from '@libs/app-jwt/types/app-jwt.enum';

@Injectable()
export class JwtAccessTokenAuthGuard extends AuthGuard('jwt') {
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

    if (
      guardType === GuardType.PUBLIC ||
      guardType === GuardType.REFRESH ||
      guardType === GuardType.BASIC
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, payload: any, info: any, context: ExecutionContext) {
    const guardType = this.reflector.getAllAndOverride<
      GuardTypeUnion,
      typeof GUARD_TYPE_TOKEN
    >(GUARD_TYPE_TOKEN, [context.getHandler(), context.getClass()]);

    if (err || !payload) {
      if (guardType === GuardType.OPTIONAL) {
        return null;
      }

      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    if (payload.tokenType !== TokenType.AccessToken) {
      if (guardType === GuardType.OPTIONAL) {
        return null;
      }

      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    return payload;
  }
}
