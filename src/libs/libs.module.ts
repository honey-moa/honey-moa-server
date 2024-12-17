import { Module } from '@nestjs/common';
import { AppJwtModule } from '@src/jwt/app-jwt.module';
import { CoreModule } from '@src/libs/core/core.module';
import { ExceptionsModule } from '@src/libs/exceptions/exceptions.module';
import { GuardModule } from '@src/libs/guards/guard.module';
import { InterceptorsModule } from '@src/libs/interceptors/interceptors.module';

@Module({
  imports: [
    CoreModule,
    ExceptionsModule,
    InterceptorsModule,
    GuardModule,
    AppJwtModule,
  ],
})
export class LibsModule {}
