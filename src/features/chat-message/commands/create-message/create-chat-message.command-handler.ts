import { CreateChatMessageCommand } from '@features/chat-message/commands/create-message/create-chat-message.command';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageRepositoryPort } from '@features/chat-message/repositories/chat-message.repository-port';
import { CHAT_MESSAGE_REPOSITORY_DI_TOKEN } from '@features/chat-message/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateChatMessageCommand)
export class createChatMessageCommandHandler
  implements ICommandHandler<CreateChatMessageCommand, void>
{
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY_DI_TOKEN)
    private readonly chatMessageRepository: ChatMessageRepositoryPort,
  ) {}

  async execute(command: CreateChatMessageCommand): Promise<void> {
    const { roomId, userId, message } = command;

    const chatMessage = ChatMessageEntity.create({
      roomId,
      senderId: userId,
      message,
    });

    await this.chatMessageRepository.create(chatMessage);
  }
}
