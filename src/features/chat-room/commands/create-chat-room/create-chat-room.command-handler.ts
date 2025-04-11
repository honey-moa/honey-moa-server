import { CreateChatRoomCommand } from '@features/chat-room/commands/create-chat-room/create-chat-room.command';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import type { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import type { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import type { AggregateID } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { CHAT_ROOM_ERROR_CODE } from '@libs/exceptions/types/errors/chat-room/chat-room-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateChatRoomCommand)
export class CreateChatRoomCommandHandler
  implements ICommandHandler<CreateChatRoomCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
  ) {}

  async execute(command: CreateChatRoomCommand): Promise<AggregateID> {
    const { userId } = command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnections: true,
      requesterConnections: true,
    });

    if (isNil(user)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
      });
    }

    const existingChatRoom =
      await this.chatRoomRepository.findOneByConnectionId(
        acceptedConnection.id,
      );

    if (!isNil(existingChatRoom)) {
      throw new HttpConflictException({
        code: CHAT_ROOM_ERROR_CODE.YOU_ALREADY_HAVE_A_CHAT_ROOM,
      });
    }

    const chatRoom = ChatRoomEntity.create({
      createdBy: userId,
      connectionId: acceptedConnection.id,
    });

    await this.chatRoomRepository.create(chatRoom);

    return chatRoom.id;
  }
}
