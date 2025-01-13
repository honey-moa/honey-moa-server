import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional/dist/src/lib/transaction-host';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { UserConnectionMapper } from '@src/apis/user/mappers/user-connection.mapper';
import { FindOneUserConnectionQuery } from '@src/apis/user/queries/user-connection/find-one-user-connection/find-one-user-connection.query';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@src/libs/utils/util';

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
