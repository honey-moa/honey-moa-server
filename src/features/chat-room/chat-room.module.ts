import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { CreateChatRoomCommandHandler } from '@features/chat-room/commands/create-chat-room/create-chat-room.command-handler';
import { ChatRoomController } from '@features/chat-room/controllers/chat-room.controller';
import { ChatRoomMapper } from '@features/chat-room/mappers/chat-room.mapper';
import { ExistsChatRoomQueryHandler } from '@features/chat-room/queries/exists-chat-room.query-handler';
import { ChatRoomRepository } from '@features/chat-room/repositories/chat-room.repository';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';

const controllers = [ChatRoomController];

const repositories: Provider[] = [
  { provide: CHAT_ROOM_REPOSITORY_DI_TOKEN, useClass: ChatRoomRepository },
];

const commandHandlers: Provider[] = [CreateChatRoomCommandHandler];

const queryHandlers: Provider[] = [ExistsChatRoomQueryHandler];

const mappers: Provider[] = [ChatRoomMapper, ChatMessageMapper];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...mappers,
  ],
  exports: [...mappers, ...repositories],
})
export class ChatRoomModule {}
