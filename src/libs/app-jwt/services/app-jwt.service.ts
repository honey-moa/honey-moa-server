import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import { TokenType } from '@libs/app-jwt/types/app-jwt.enum';
import { JwtPayload } from '@libs/app-jwt/types/app-jwt.interface';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
  generateToken(payload: JwtPayload): Promise<string> {
    const expiresIn =
      payload.tokenType === TokenType.RefreshToken
        ? this.appConfigService.get<number>(
            ENV_KEY.JWT_REFRESH_TOKEN_EXPIRES_IN,
          )
        : this.appConfigService.get<number>(
            ENV_KEY.JWT_ACCESS_TOKEN_EXPIRES_IN,
          );

    return this.jwtService.signAsync(
      { tokenType: payload.tokenType },
      {
        expiresIn,
        subject: payload.sub,
      },
    );
  }

  verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }
  }
}
