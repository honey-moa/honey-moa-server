import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { UserModule } from '@features/user/user.module';
import { TagModule } from '@src/features/tag/tag.module';
import { ChatRoomModule } from '@features/chat-room/chat-room.module';
import { ChatMessageModule } from '@features/chat-message/chat-message.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TagModule,
    ChatRoomModule,
    ChatMessageModule,
  ],
})
export class FeaturesModule {}
