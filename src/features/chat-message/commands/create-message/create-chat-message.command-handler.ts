import { CreateChatMessageCommand } from '@features/chat-message/commands/create-message/create-chat-message.command';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateChatMessageCommand)
export class CreateChatMessageCommandHandler
  implements ICommandHandler<CreateChatMessageCommand, ChatMessageResponseDto>
{
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
  ) {}

  async execute(
    command: CreateChatMessageCommand,
  ): Promise<ChatMessageResponseDto> {
    const { roomId, userId, message, blogPostUrl } = command;

    const chatRoom = await this.chatRoomRepository.findOneById(roomId);

    if (isNil(chatRoom)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const connection =
      await this.userConnectionRepository.findOneByUserIdAndStatus(
        userId,
        UserConnectionStatus.ACCEPTED,
      );

    if (isNil(connection)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'connection not found',
      });
    }

    if (chatRoom.getProps().connectionId !== connection.id) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    const entity = ChatMessageEntity.create({
      roomId,
      senderId: userId,
      message,
      blogPostUrl,
    });

    return this.chatRoomRepository.createChatMessage(entity);
  }
}
