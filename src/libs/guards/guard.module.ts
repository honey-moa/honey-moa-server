import { Module, Provider } from '@nestjs/common';
import { BasicTokenGuard } from '@libs/guards/providers/basic-auth.guard';
import { JwtAccessTokenAuthGuard } from '@libs/guards/providers/jwt-access-token-auth.guard';
import { JwtBearerAuthStrategy } from '@libs/guards/providers/jwt-bearer-auth.strategy';
import { SocketJwtBearerAuthGuard } from '@libs/guards/providers/socket-jwt-bearer-auth.guard';
import { JwtRefreshTokenAuthGuard } from '@libs/guards/providers/jwt-refresh-token-auth.guard';

const guards: Provider[] = [
  JwtAccessTokenAuthGuard,
  JwtRefreshTokenAuthGuard,
  JwtBearerAuthStrategy,
  BasicTokenGuard,
  SocketJwtBearerAuthGuard,
];

@Module({
  providers: [...guards],
})
export class GuardModule {}
