import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ChatMessageEntity } from '@src/features/user/domain/user-connection/chat-message/chat-message.entity';
import { ChatMessageMapper } from '@src/features/user/mappers/chat-message.mapper';
import { FindChatMessagesQuery } from '@src/features/user/queries/user-connection/find-chat-messages/find-chat-messages.query';
import { SortOrder } from '@src/libs/api/types/api.constant';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { Paginated } from '@src/libs/types/type';

@QueryHandler(FindChatMessagesQuery)
export class FindChatMessagesQueryHandler
  implements IQueryHandler<FindChatMessagesQuery, Paginated<ChatMessageEntity>>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly chatMessageMapper: ChatMessageMapper,
  ) {}

  async execute(
    query: FindChatMessagesQuery,
  ): Promise<Paginated<ChatMessageEntity>> {
    const { roomId, cursor, skip, take, orderBy } = query;

    const [chatMessages, count] = await Promise.all([
      this.txHost.tx.chatMessage.findMany({
        ...(cursor?.id && {
          cursor: {
            id: cursor?.id,
            ...(cursor?.createdAt && { createdAt: cursor?.createdAt }),
            ...(cursor?.updatedAt && { updatedAt: cursor?.updatedAt }),
          },
        }),
        where: {
          roomId: { equals: BigInt(roomId.toString()) },
        },
        orderBy: orderBy,
        // orderBy: {
        //   createdAt: SortOrder.DESC,
        // },
        skip,
        take,
      }),

      this.txHost.tx.chatMessage.count({
        where: {
          roomId: { equals: BigInt(roomId.toString()) },
        },
      }),
    ]);

    return [chatMessages.map(this.chatMessageMapper.toEntity), count];
  }
}
