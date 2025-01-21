import { ChatMessageController } from '@features/chat-message/controllers/chat-message.controller';
import { ChatMessageGateway } from '@features/chat-message/chat-message.gateway';
import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { FindChatMessagesQueryHandler } from '@features/chat-message/queries/find-chat-messages/find-chat-messages.query-handler';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';

const controllers = [ChatMessageController];

const queryHandlers: Provider[] = [FindChatMessagesQueryHandler];

const mappers: Provider[] = [ChatMessageMapper, ChatMessageGateway];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [...queryHandlers, ...mappers],
  exports: [...mappers],
})
export class ChatMessageModule {}
