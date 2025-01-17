import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import type { JwtPayload } from '@libs/app-jwt/types/app-jwt.interface';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';

@Injectable()
export class AppJwtService implements AppJwtServicePort {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  /**
   * @todo 이후 클라이언트의 도메인이 정해지면 audience 추가
   */
  generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      {},
      {
        expiresIn: '1d',
        subject: payload.sub,
      },
    );
  }

  verifyAccessToken(accessToken: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verifyAsync(accessToken);
    } catch {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }
  }
}
