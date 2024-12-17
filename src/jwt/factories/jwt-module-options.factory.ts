import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { ENV_KEY } from '@src/libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@src/libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@src/libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@src/libs/core/app-config/types/app-config.type';

@Injectable()
export class JwtModuleOptionsFactory implements JwtOptionsFactory {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.appConfigService.get<string>(ENV_KEY.JWT_SECRET),
    };
  }
}
