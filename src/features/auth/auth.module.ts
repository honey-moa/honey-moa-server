import { GenerateAccessTokenCommandHandler } from '@features/auth/commands/generate-access-token/generate-access-token.command-handler';
import { GenerateJwtCommandHandler } from '@features/auth/commands/generate-jwt/generate-jwt.command-handler';
import { AuthController } from '@features/auth/controllers/auth.controller';
import { UserModule } from '@features/user/user.module';
import { AppJwtModule } from '@libs/app-jwt/app-jwt.module';
import { GuardModule } from '@libs/guards/guard.module';
import { Module } from '@nestjs/common';

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
