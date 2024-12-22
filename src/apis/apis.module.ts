import { Module } from '@nestjs/common';
import { PostModule } from '@src/apis/post/post.module';
import { TokenModule } from '@src/apis/token/token.module';
import { UserModule } from '@src/apis/user/user.module';

@Module({
  imports: [TokenModule, PostModule, UserModule],
})
export class ApisModule {}
