import type { UserEntity } from '@features/user/domain/user.entity';
import type { UserMapper } from '@features/user/mappers/user.mapper';
import type { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import type { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { FindUserConnectionsQuery } from '@features/user/user-connection/queries/find-user-connections/find-user-connections.query';
import type { PrismaService } from '@libs/core/prisma/services/prisma.service';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { Paginated } from '@libs/types/type';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

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

    for (const userConnection of userConnections) {
      allUserIdSet.add(userConnection.requesterId);
      allUserIdSet.add(userConnection.requestedId);
    }

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

    for (const user of userEntities) {
      userMap.set(user.id, user);
    }

    for (const userConnection of userConnectionEntities) {
      const requesterUser = userMap.get(userConnection.requesterId);
      const requestedUser = userMap.get(userConnection.requestedId);

      if (requesterUser) {
        userConnection.hydrateRequesterUser(requesterUser);
      }

      if (requestedUser) {
        userConnection.hydrateRequestedUser(requestedUser);
      }
    }

    return [userConnectionEntities, count];
  }
}
