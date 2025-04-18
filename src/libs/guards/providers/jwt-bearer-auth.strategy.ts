import { JwtPayload } from '@libs/app-jwt/types/app-jwt.interface';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtBearerAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get<string>(ENV_KEY.JWT_SECRET),
      issuer: appConfigService.get<string>(ENV_KEY.DOMAIN),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
