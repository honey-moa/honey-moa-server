import { Module } from '@nestjs/common';
import { GuardModule } from '@libs/guards/guard.module';
import { AppJwtModule } from '@libs/app-jwt/app-jwt.module';
import { UserModule } from '@features/user/user.module';
import { GenerateAccessTokenCommandHandler } from '@features/auth/commands/generate-access-token/generate-access-token.command-handler';
import { AuthController } from '@features/auth/controllers/auth.controller';

const controllers = [AuthController];

const commandHandlers = [GenerateAccessTokenCommandHandler];

@Module({
  imports: [GuardModule, AppJwtModule, UserModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class AuthModule {}
