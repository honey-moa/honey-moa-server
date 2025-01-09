import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { Request } from 'express';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
      });
    }

    const token = this.extractTokenFromHeader(rawToken);

    const { email, password } = this.decodeBasicToken(token);

    req.user = { email, password };

    return true;
  }

  private extractTokenFromHeader(header: string): string {
    const splitToken = header.split(' ');

    const prefix = 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const token = splitToken[1];

    return token;
  }

  private decodeBasicToken(base64String: string): {
    email: string;
    password: string;
  } {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }
}
