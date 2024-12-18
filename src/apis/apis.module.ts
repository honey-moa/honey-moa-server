import { Module } from '@nestjs/common';
import { AuthModule } from '@src/apis/auth/auth.module';
import { PostModule } from '@src/apis/post/post.module';
import { UserModule } from '@src/apis/user/user.module';

@Module({
  imports: [AuthModule, PostModule, UserModule],
})
export class ApisModule {}
