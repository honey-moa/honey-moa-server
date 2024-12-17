import { Module } from '@nestjs/common';
import { GenerateAccessTokenCommandHandler } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command-handler';
import { AuthController } from '@src/apis/auth/controllers/auth.controller';
import { AppJwtModule } from '@src/jwt/app-jwt.module';
import { GuardModule } from '@src/libs/guards/guard.module';

const controllers = [AuthController];

const commandHandlers = [GenerateAccessTokenCommandHandler];

@Module({
  imports: [GuardModule, AppJwtModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class AuthModule {}
