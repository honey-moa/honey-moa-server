import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { ChatRoomUserConnectionDisconnectDomainEventHandler } from '@features/chat-room/application/event-handlers/chat-room-user-connection-disconnect.domain-event-handler';
import { CreateChatRoomCommandHandler } from '@features/chat-room/commands/create-chat-room/create-chat-room.command-handler';
import { ChatRoomController } from '@features/chat-room/controllers/chat-room.controller';
import { ChatRoomMapper } from '@features/chat-room/mappers/chat-room.mapper';
import { FindOneChatRoomByUserIdQueryHandler } from '@features/chat-room/queries/find-one-chat-room-by-user-id/find-one-chat-room-by-user-id.query-handler';
import { ChatRoomRepository } from '@features/chat-room/repositories/chat-room.repository';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserModule } from '@features/user/user.module';
import { Module, type Provider } from '@nestjs/common';

const controllers = [ChatRoomController];

const repositories: Provider[] = [
  { provide: CHAT_ROOM_REPOSITORY_DI_TOKEN, useClass: ChatRoomRepository },
];

const commandHandlers: Provider[] = [CreateChatRoomCommandHandler];

const eventHandlers: Provider[] = [
  ChatRoomUserConnectionDisconnectDomainEventHandler,
];

const queryHandlers: Provider[] = [FindOneChatRoomByUserIdQueryHandler];

const mappers: Provider[] = [ChatRoomMapper, ChatMessageMapper];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...mappers,
    ...eventHandlers,
  ],
  exports: [...mappers, ...repositories],
})
export class ChatRoomModule {}
