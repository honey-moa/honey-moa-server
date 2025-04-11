import { AttachmentModule } from '@features/attachment/attachment.module';
import { AuthModule } from '@features/auth/auth.module';
import { BlogPostModule } from '@features/blog-post/blog-post.module';
import { BlogModule } from '@features/blog/blog.module';
import { ChatMessageModule } from '@features/chat-message/chat-message.module';
import { ChatRoomModule } from '@features/chat-room/chat-room.module';
import { UserModule } from '@features/user/user.module';
import { Module } from '@nestjs/common';
import { TagModule } from '@src/features/tag/tag.module';

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
