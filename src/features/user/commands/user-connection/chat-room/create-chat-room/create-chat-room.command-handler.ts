import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateChatRoomCommand } from '@features/user/commands/user-connection/chat-room/create-chat-room/create-chat-room.command';
import { ChatRoomEntity } from '@features/user/domain/user-connection/chat-room/chat-room.entity';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { CHAT_ROOM_ERROR_CODE } from '@libs/exceptions/types/errors/chat-room/chat-room-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';

@CommandHandler(CreateChatRoomCommand)
export class CreateChatRoomCommandHandler
  implements ICommandHandler<CreateChatRoomCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: CreateChatRoomCommand): Promise<AggregateID> {
    const { userId, connectionId, name } = command;

    const user = await this.userRepository.findOneUserByIdAndConnectionId(
      userId,
      connectionId,
      undefined,
      {
        requestedConnection: {
          include: { chatRoom: true },
        },
        requesterConnection: {
          include: { chatRoom: true },
        },
      },
    );

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
      });
    }

    if (!isNil(acceptedConnection.chatRoom)) {
      throw new HttpConflictException({
        code: CHAT_ROOM_ERROR_CODE.YOU_ALREADY_HAVE_A_CHAT_ROOM,
      });
    }

    const chatRoom = ChatRoomEntity.create({
      createdBy: userId,
      connectionId,
      name,
    });

    await this.userRepository.createChatRoom(chatRoom);

    return chatRoom.id;
  }
}
