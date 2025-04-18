import { FindOneChatRoomByUserIdQuery } from '@features/chat-room/queries/find-one-chat-room-by-user-id/find-one-chat-room-by-user-id.query';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindOneChatRoomByUserIdQuery)
export class FindOneChatRoomByUserIdQueryHandler
  implements IQueryHandler<FindOneChatRoomByUserIdQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindOneChatRoomByUserIdQuery) {
    const { userId } = query;

    const chatRoom = await this.txHost.tx.chatRoom.findFirst({
      where: {
        connection: {
          status: UserConnectionStatus.ACCEPTED,
          OR: [{ requesterId: userId }, { requestedId: userId }],
        },
      },
    });

    if (isNil(chatRoom)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return chatRoom;
  }
}
