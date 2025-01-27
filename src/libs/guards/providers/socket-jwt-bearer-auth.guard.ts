import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';

export class SocketJwtBearerAuthGuard implements CanActivate {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const socket = context.switchToWs().getClient();

    const token = this.extractTokenFromSocket(socket);

    if (!token) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        this.appConfigService.get<string>(ENV_KEY.JWT_SECRET),
      );

      // socket.user.sub = decoded.sub;
      socket.user = { sub: decoded.sub };
      return true;
    } catch (error) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }
  }

  private extractTokenFromSocket(socket: any): string | null {
    const auth = socket.handshake.headers.authorization;

    if (!auth) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
      });
    }

    const splitToken = auth.split(' ');

    const prefix = 'Bearer';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const token = splitToken[1];

    return token || null;
  }
}
