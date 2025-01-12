import { Module } from '@nestjs/common';
import { CoreModule } from '@src/libs/core/core.module';
import { ExceptionsModule } from '@src/libs/exceptions/exceptions.module';
import { GuardModule } from '@src/libs/guards/guard.module';
import { InterceptorsModule } from '@src/libs/interceptors/interceptors.module';
import { AppJwtModule } from '@src/libs/app-jwt/app-jwt.module';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerModuleOptionsFactory } from '@src/libs/logger/factories/winston-logger-options.factory';

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
