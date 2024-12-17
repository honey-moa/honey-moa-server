import { Module, Provider } from '@nestjs/common';
import { UserModule } from '@src/apis/user/user.module';
import { BasicTokenGuard } from '@src/libs/guards/providers/basic-auth.guard';
import { JwtBearerAuthGuard } from '@src/libs/guards/providers/jwt-bearer-auth.guard';
import { JwtBearerAuthStrategy } from '@src/libs/guards/providers/jwt-bearer-auth.strategy';

const guards: Provider[] = [
  JwtBearerAuthGuard,
  JwtBearerAuthStrategy,
  BasicTokenGuard,
];

@Module({
  imports: [UserModule],
  providers: [...guards],
  exports: [UserModule],
})
export class GuardModule {}
