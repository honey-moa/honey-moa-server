import { Module, Provider } from '@nestjs/common';
import { BasicTokenGuard } from '@src/libs/guards/providers/basic-auth.guard';
import { JwtBearerAuthGuard } from '@src/libs/guards/providers/jwt-bearer-auth.guard';
import { JwtBearerAuthStrategy } from '@src/libs/guards/providers/jwt-bearer-auth.strategy';

const guards: Provider[] = [
  JwtBearerAuthGuard,
  JwtBearerAuthStrategy,
  BasicTokenGuard,
];

@Module({
  providers: [...guards],
})
export class GuardModule {}
