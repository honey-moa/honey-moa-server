import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import type { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import type { Key } from '@libs/core/app-config/types/app-config.type';
import { Inject, Injectable } from '@nestjs/common';
import type { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtModuleOptionsFactory implements JwtOptionsFactory {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.appConfigService.get<string>(ENV_KEY.JWT_SECRET),
      signOptions: {
        issuer: this.appConfigService.get<string>(ENV_KEY.DOMAIN),
      },
    };
  }
}
