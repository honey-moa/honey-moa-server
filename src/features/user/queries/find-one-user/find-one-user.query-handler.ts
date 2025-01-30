import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { FindOneUserQuery } from '@features/user/queries/find-one-user/find-one-user.query';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';

@QueryHandler(FindOneUserQuery)
export class FindOneUserQueryHandler
  implements IQueryHandler<FindOneUserQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  execute(query: FindOneUserQuery) {
    const { userId } = query;

    return this.txHost.tx.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        requesterConnections: {
          where: {
            status: UserConnectionStatus.ACCEPTED,
          },
        },
        requestedConnections: {
          where: {
            status: UserConnectionStatus.ACCEPTED,
          },
        },
      },
    });
  }
}
