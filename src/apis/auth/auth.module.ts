import { Module } from '@nestjs/common';
import { GenerateAccessTokenCommandHandler } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command-handler';
import { AuthController } from '@src/apis/auth/controllers/auth.controller';
import { GuardModule } from '@src/libs/guards/guard.module';
import { AppJwtModule } from '@src/libs/app-jwt/app-jwt.module';

const controllers = [AuthController];

const commandHandlers = [GenerateAccessTokenCommandHandler];

@Module({
  imports: [GuardModule, AppJwtModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class AuthModule {}
