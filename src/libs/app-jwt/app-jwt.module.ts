import { JwtModuleOptionsFactory } from '@libs/app-jwt/factories/jwt-module-options.factory';
import { AppJwtService } from '@libs/app-jwt/services/app-jwt.service';
import { APP_JWT_SERVICE_DI_TOKEN } from '@libs/app-jwt/tokens/app-jwt.di-token';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

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
