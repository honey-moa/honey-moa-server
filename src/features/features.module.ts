import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { UserModule } from '@features/user/user.module';
import { TagModule } from '@src/features/tag/tag.module';
import { ChatMessageModule } from '@features/chat-message/chat-message.module';
import { BlogModule } from '@features/blog/blog.module';
import { BlogPostModule } from '@features/blog-post/blog-post.module';
import { ChatRoomModule } from '@features/chat-room/chat-room.module';
import { AttachmentModule } from '@features/attachment/attachment.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TagModule,
    ChatRoomModule,
    ChatMessageModule,
    BlogModule,
    BlogPostModule,
    ChatRoomModule,
    AttachmentModule,
  ],
})
export class FeaturesModule {}
