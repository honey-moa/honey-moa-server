import { ChatRoomController } from '@features/chat-room/controllers/chat-room.controller';
import { ChatRoomMapper } from '@features/chat-room/mappers/chat-room.mapper';
import { ChatRoomRepository } from '@features/chat-room/repositories/chat-room.repository';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';

const controllers = [ChatRoomController];

const repositories: Provider[] = [
  { provide: CHAT_ROOM_REPOSITORY_DI_TOKEN, useClass: ChatRoomRepository },
];

const mappers: Provider[] = [ChatRoomMapper];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [...repositories, ...mappers],
  exports: [...mappers],
})
export class ChatRoomModule {}
