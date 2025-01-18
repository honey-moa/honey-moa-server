import { Module } from '@nestjs/common';
import { CoreModule } from '@libs/core/core.module';
import { ExceptionsModule } from '@libs/exceptions/exceptions.module';
import { GuardModule } from '@libs/guards/guard.module';
import { InterceptorsModule } from '@libs/interceptors/interceptors.module';
import { AppJwtModule } from '@libs/app-jwt/app-jwt.module';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerModuleOptionsFactory } from '@libs/logger/factories/winston-logger-options.factory';

@Module({
  imports: [
    CoreModule,
    ExceptionsModule,
    InterceptorsModule,
    GuardModule,
    AppJwtModule,
    WinstonModule.forRootAsync({
      useClass: WinstonLoggerModuleOptionsFactory,
    }),
  ],

  providers: [WinstonLoggerModuleOptionsFactory],
})
export class LibsModule {}
