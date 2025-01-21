import { Module, Provider } from '@nestjs/common';
import { BasicTokenGuard } from '@libs/guards/providers/basic-auth.guard';
import { JwtBearerAuthGuard } from '@libs/guards/providers/jwt-bearer-auth.guard';
import { JwtBearerAuthStrategy } from '@libs/guards/providers/jwt-bearer-auth.strategy';
import { SocketJwtBearerAuthGuard } from '@libs/guards/providers/socket-jwt-bearer-auth.guard';

const guards: Provider[] = [
  JwtBearerAuthGuard,
  JwtBearerAuthStrategy,
  BasicTokenGuard,
  SocketJwtBearerAuthGuard,
];

@Module({
  providers: [...guards],
})
export class GuardModule {}
