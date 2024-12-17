import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtModuleOptionsFactory } from '@src/jwt/factories/jwt-module-options.factory';

import { AppJwtService } from '@src/jwt/services/app-jwt.service';
import { APP_JWT_SERVICE_DI_TOKEN } from '@src/jwt/tokens/app-jwt.di-token';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtModuleOptionsFactory,
    }),
  ],
  providers: [{ provide: APP_JWT_SERVICE_DI_TOKEN, useClass: AppJwtService }],
  exports: [APP_JWT_SERVICE_DI_TOKEN],
})
export class AppJwtModule {}
