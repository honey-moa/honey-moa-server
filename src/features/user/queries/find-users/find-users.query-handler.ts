import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserMapper } from '@features/user/mappers/user.mapper';
import { FindUsersQuery } from '@features/user/queries/find-users/find-users.query';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { Paginated } from '@libs/types/type';

@QueryHandler(FindUsersQuery)
export class FindUsersQueryHandler
  implements IQueryHandler<FindUsersQuery, Paginated<UserEntity>>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: FindUsersQuery): Promise<Paginated<UserEntity>> {
    const { cursor, email, nickname, isEmailVerified, orderBy, skip, take } =
      query;

    const whereProps = {
      email: {
        contains: email,
      },
      nickname: {
        contains: nickname,
      },
      isEmailVerified,
      deletedAt: null,
    };

    const cursorProps = {
      ...(cursor?.id && {
        cursor: {
          id: cursor?.id,
          ...(cursor?.createdAt && { createdAt: cursor?.createdAt }),
          ...(cursor?.updatedAt && { updatedAt: cursor?.updatedAt }),
        },
      }),
    };

    const [users, count] = await Promise.all([
      this.txHost.tx.user.findMany({
        where: whereProps,
        ...cursorProps,
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

      this.txHost.tx.user.count({
        where: whereProps,
      }),
    ]);

    return [users.map((user) => this.userMapper.toEntity(user)), count];
  }
}
