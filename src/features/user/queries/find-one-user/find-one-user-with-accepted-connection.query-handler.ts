import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { FindOneUserWithAcceptedConnectionQuery } from '@features/user/queries/find-one-user/find-one-user-with-accepted-connection.query';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { isNil } from '@libs/utils/util';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';

@QueryHandler(FindOneUserWithAcceptedConnectionQuery)
export class FindOneUserWithAcceptedConnectionQueryHandler
  implements IQueryHandler<FindOneUserWithAcceptedConnectionQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindOneUserWithAcceptedConnectionQuery) {
    const { userId } = query;

    const user = await this.txHost.tx.user.findUnique({
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

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (user?.requestedConnections.length) {
      return {
        ...user,
        acceptedConnection: user.requestedConnections.find(
          (connection) => connection.status === UserConnectionStatus.ACCEPTED,
        ),
      };
    } else if (user?.requesterConnections.length) {
      return {
        ...user,
        acceptedConnection: user.requesterConnections.find(
          (connection) => connection.status === UserConnectionStatus.ACCEPTED,
        ),
      };
    }

    return user;
  }
}
