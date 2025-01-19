import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional/dist/src/lib/transaction-host';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOneUserConnectionQuery } from '@features/user/user-connection/queries/find-one-user-connection/find-one-user-connection.query';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { UserConnectionWithEntitiesModel } from '@features/user/user-connection/mappers/user-connection.mapper';

@QueryHandler(FindOneUserConnectionQuery)
export class FindOneUserConnectionQueryHandler
  implements
    IQueryHandler<FindOneUserConnectionQuery, UserConnectionWithEntitiesModel>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(
    query: FindOneUserConnectionQuery,
  ): Promise<UserConnectionWithEntitiesModel> {
    const userConnection = await this.txHost.tx.userConnection.findUnique({
      where: {
        id: query.userConnectionId,
        status: UserConnectionStatus.ACCEPTED,
      },
      include: {
        blog: true,
        chatRoom: true,
      },
    });

    if (isNil(userConnection)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return userConnection;
  }
}
