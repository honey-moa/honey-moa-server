import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional/dist/src/lib/transaction-host';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { FindOneUserConnectionQuery } from '@features/user/queries/user-connection/find-one-user-connection/find-one-user-connection.query';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';

@QueryHandler(FindOneUserConnectionQuery)
export class FindOneUserConnectionQueryHandler
  implements IQueryHandler<FindOneUserConnectionQuery, UserConnectionEntity>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly userConnectionMapper: UserConnectionMapper,
  ) {}

  async execute(
    query: FindOneUserConnectionQuery,
  ): Promise<UserConnectionEntity> {
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

    return this.userConnectionMapper.toEntity(userConnection);
  }
}
