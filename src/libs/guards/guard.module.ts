import { BasicTokenGuard } from '@libs/guards/providers/basic-auth.guard';
import { JwtAccessTokenAuthGuard } from '@libs/guards/providers/jwt-access-token-auth.guard';
import { JwtBearerAuthStrategy } from '@libs/guards/providers/jwt-bearer-auth.strategy';
import { JwtRefreshTokenAuthGuard } from '@libs/guards/providers/jwt-refresh-token-auth.guard';
import { Module, type Provider } from '@nestjs/common';

const guards: Provider[] = [
  JwtAccessTokenAuthGuard,
  JwtRefreshTokenAuthGuard,
  JwtBearerAuthStrategy,
  BasicTokenGuard,
];

@Module({
  providers: [...guards],
})
export class GuardModule {}
