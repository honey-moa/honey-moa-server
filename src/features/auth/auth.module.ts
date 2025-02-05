import { Module } from '@nestjs/common';
import { GuardModule } from '@libs/guards/guard.module';
import { AppJwtModule } from '@libs/app-jwt/app-jwt.module';
import { UserModule } from '@features/user/user.module';
import { GenerateJwtCommandHandler } from '@features/auth/commands/generate-jwt/generate-jwt.command-handler';
import { AuthController } from '@features/auth/controllers/auth.controller';
import { GenerateAccessTokenCommandHandler } from '@features/auth/commands/generate-access-token/generate-access-token.command-handler';

const controllers = [AuthController];

const commandHandlers = [
  GenerateJwtCommandHandler,
  GenerateAccessTokenCommandHandler,
];

@Module({
  imports: [GuardModule, AppJwtModule, UserModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class AuthModule {}
