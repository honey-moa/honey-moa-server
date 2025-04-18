import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatMessageMapper } from '@src/features/chat-message/mappers/chat-message.mapper';
import { FindChatMessagesQuery } from '@src/features/chat-message/queries/find-chat-messages/find-chat-messages.query';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { Paginated } from '@src/libs/types/type';

@QueryHandler(FindChatMessagesQuery)
export class FindChatMessagesQueryHandler
  implements IQueryHandler<FindChatMessagesQuery, Paginated<ChatMessageEntity>>
{
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly chatMessageMapper: ChatMessageMapper,
  ) {}

  async execute(
    query: FindChatMessagesQuery,
  ): Promise<Paginated<ChatMessageEntity>> {
    const { userId, roomId, cursor, skip, take, orderBy } = query;

    const chatRoom = await this.chatRoomRepository.findOneById(roomId);

    if (isNil(chatRoom)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    // 채팅방에 참여하고 있는지 확인.
    const connection =
      await this.userConnectionRepository.findOneByUserIdAndStatus(
        userId,
        UserConnectionStatus.ACCEPTED,
      );

    if (isNil(connection)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (chatRoom.getProps().connectionId !== connection.getProps().id) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    const [chatMessages, count] = await Promise.all([
      this.txHost.tx.chatMessage.findMany({
        cursor: cursor ? { id: cursor.id } : undefined,
        where: {
          roomId,
        },
        orderBy: [
          {
            id: orderBy?.id,
          },
          {
            createdAt: orderBy?.createdAt,
          },
          {
            updatedAt: orderBy?.updatedAt,
          },
        ],
        skip,
        take,
      }),

      this.txHost.tx.chatMessage.count({
        where: {
          roomId,
        },
      }),
    ]);

    return [chatMessages.map(this.chatMessageMapper.toEntity), count];
  }
}
