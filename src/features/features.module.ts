import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { UserModule } from '@features/user/user.module';
import { TagModule } from '@src/features/tag/tag.module';

@Module({
  imports: [AuthModule, UserModule, TagModule],
})
export class FeaturesModule {}
