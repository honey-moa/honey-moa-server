import { Module } from '@nestjs/common';
import { GuardModule } from '@src/libs/guards/guard.module';
import { AppJwtModule } from '@src/libs/app-jwt/app-jwt.module';
import { TokenController } from '@src/apis/token/controllers/token.controller';
import { GenerateAccessTokenCommandHandler } from '@src/apis/token/commands/generate-access-token/generate-access-token.command-handler';

const controllers = [TokenController];

const commandHandlers = [GenerateAccessTokenCommandHandler];

@Module({
  imports: [GuardModule, AppJwtModule],
  controllers: [...controllers],
  providers: [...commandHandlers],
})
export class TokenModule {}
