import { ChatMessageController } from '@features/chat-message/controllers/chat-message.controller';
import { ChatMessageGateway } from '@features/chat-message/gateways/chat-message.gateway';
import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { FindChatMessagesQueryHandler } from '@features/chat-message/queries/find-chat-messages/find-chat-messages.query-handler';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';
import { ChatRoomModule } from '@features/chat-room/chat-room.module';
import { ChatMessageRepository } from '@features/chat-message/repositories/chat-message.repository';
import { CHAT_MESSAGE_REPOSITORY_DI_TOKEN } from '@features/chat-message/tokens/di.token';
import { CreateChatMessageCommandHandler } from '@features/chat-message/commands/create-message/create-chat-message.command-handler';
import { GuardModule } from '@libs/guards/guard.module';
import { AppJwtModule } from '@libs/app-jwt/app-jwt.module';

const controllers = [ChatMessageController];

const repositories: Provider[] = [
  {
    provide: CHAT_MESSAGE_REPOSITORY_DI_TOKEN,
    useClass: ChatMessageRepository,
  },
];

const commandHandlers: Provider[] = [CreateChatMessageCommandHandler];

const queryHandlers: Provider[] = [FindChatMessagesQueryHandler];

const mappers: Provider[] = [ChatMessageMapper];

const gateways: Provider[] = [ChatMessageGateway];

@Module({
  imports: [UserModule, ChatRoomModule, GuardModule, AppJwtModule],
  controllers: [...controllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...mappers,
    ...gateways,
  ],
  exports: [...mappers],
})
export class ChatMessageModule {}
