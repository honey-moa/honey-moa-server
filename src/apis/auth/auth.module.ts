import { Module } from '@nestjs/common';
import { GuardModule } from '@src/libs/guards/guard.module';
import { AppJwtModule } from '@src/libs/app-jwt/app-jwt.module';
import { UserModule } from '@src/apis/user/user.module';
import { GenerateAccessTokenCommandHandler } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command-handler';
import { AuthController } from '@src/apis/auth/controllers/auth.controller';

const controllers = [AuthController];

const commandHandlers = [GenerateAccessTokenCommandHandler];

@Module({
  imports: [GuardModule, AppJwtModule, UserModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class AuthModule {}
