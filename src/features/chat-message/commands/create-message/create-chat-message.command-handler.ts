import { CreateChatMessageCommand } from '@features/chat-message/commands/create-message/create-chat-message.command';
import { CHAT_MESSAGE_REPOSITORY_DI_TOKEN } from '@features/chat-message/tokens/di.token';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WsException } from '@nestjs/websockets';

@CommandHandler(CreateChatMessageCommand)
export class CreateChatMessageCommandHandler
  implements ICommandHandler<CreateChatMessageCommand, void>
{
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
  ) {}

  async execute(command: CreateChatMessageCommand): Promise<void> {
    const { roomId, userId, message } = command;

    const chatRoom = await this.chatRoomRepository.findOneById(roomId);

    if (!chatRoom) {
      throw new WsException(COMMON_ERROR_CODE.RESOURCE_NOT_FOUND);
    }

    const chatMessage = chatRoom.createChatMessage({
      roomId,
      senderId: userId,
      message,
    });

    await this.chatRoomRepository.createChatMessage(chatMessage);
  }
}
