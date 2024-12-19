import { Module } from '@nestjs/common';
import { CoreModule } from '@src/libs/core/core.module';
import { ExceptionsModule } from '@src/libs/exceptions/exceptions.module';
import { GuardModule } from '@src/libs/guards/guard.module';
import { InterceptorsModule } from '@src/libs/interceptors/interceptors.module';
import { AppJwtModule } from '@src/libs/jwt/app-jwt.module';

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
