import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { PostModule } from '@features/post/post.module';
import { UserModule } from '@features/user/user.module';
import { TagModule } from '@src/features/tag/tag.module';

@Module({
  imports: [AuthModule, PostModule, UserModule, TagModule],
})
export class FeaturesModule {}
