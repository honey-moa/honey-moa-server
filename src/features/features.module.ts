import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { PostModule } from '@features/post/post.module';
import { UserModule } from '@features/user/user.module';

@Module({
  imports: [AuthModule, PostModule, UserModule],
})
export class FeaturesModule {}
