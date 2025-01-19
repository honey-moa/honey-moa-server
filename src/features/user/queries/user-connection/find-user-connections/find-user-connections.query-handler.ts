import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserMapper } from '@features/user/mappers/user.mapper';
import { FindUserConnectionsQuery } from '@features/user/queries/user-connection/find-user-connections/find-user-connections.query';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { Paginated } from '@libs/types/type';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';

@QueryHandler(FindUserConnectionsQuery)
export class FindUserConnectionsQueryHandler
  implements
    IQueryHandler<FindUserConnectionsQuery, Paginated<UserConnectionEntity>>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly mapper: UserConnectionMapper,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(
    query: FindUserConnectionsQuery,
  ): Promise<Paginated<UserConnectionEntity>> {
    const { userId, showRequest, showRequested, status, orderBy, skip, take } =
      query;

    const or: { requesterId?: AggregateID; requestedId?: AggregateID }[] = [];

    if (showRequest) {
      or.push({ requesterId: userId });
    } else if (showRequested) {
      or.push({ requestedId: userId });
    } else {
      or.push({ requesterId: userId }, { requestedId: userId });
    }

    const [userConnections, count] = await Promise.all([
      this.txHost.tx.userConnection.findMany({
        where: {
          OR: or,
          status: {
            in: status,
          },
        },
        orderBy: [
          {
            id: orderBy.id,
          },
          {
            createdAt: orderBy.createdAt,
          },
          {
            updatedAt: orderBy.updatedAt,
          },
        ],
        skip,
        take,
      }),
      this.txHost.tx.userConnection.count({
        where: {
          OR: or,
        },
      }),
    ]);

    const userConnectionEntities = userConnections.map(this.mapper.toEntity);

    const allUserIdSet = new Set<AggregateID>();

    userConnections.forEach((userConnection) => {
      allUserIdSet.add(userConnection.requesterId);
      allUserIdSet.add(userConnection.requestedId);
    });

    const users = await this.txHost.tx.user.findMany({
      where: {
        id: {
          in: [...allUserIdSet],
        },
      },
    });

    /**
     * @todo 나중에 도메인 서비스로 로직 이관해야 함.
     */
    const userEntities = users.map((user) => this.userMapper.toEntity(user));

    const userMap = new Map<AggregateID, UserEntity>();

    userEntities.forEach((user) => {
      userMap.set(user.id, user);
    });

    userConnectionEntities.forEach((userConnection) => {
      const requesterUser = userMap.get(userConnection.requesterId);
      const requestedUser = userMap.get(userConnection.requestedId);

      requesterUser?.hydrate(userConnection);
      requestedUser?.hydrate(userConnection);
    });

    return [userConnectionEntities, count];
  }
}
