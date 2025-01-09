import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';
import { Paginated } from '@src/libs/types/type';

export class FindUsersQuery extends PaginatedQueryBase implements IQuery {
  readonly email?: string;
  readonly nickname?: string;
  readonly isEmailVerified?: boolean;

  constructor(props: PaginatedParams<FindUsersQuery>) {
    super(props);

    const { email, nickname, isEmailVerified } = props;

    this.email = email;
    this.nickname = nickname;
    this.isEmailVerified = isEmailVerified;
  }
}

@QueryHandler(FindUsersQuery)
export class FindUsersQueryHandler
  implements IQueryHandler<FindUsersQuery, Paginated<UserEntity>>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: FindUsersQuery): Promise<Paginated<UserEntity>> {
    const { cursor, email, nickname, isEmailVerified, orderBy, skip, take } =
      query;

    const [users, count] = await Promise.all([
      this.prisma.user.findMany({
        ...(cursor?.id && {
          cursor: {
            id: cursor?.id,
            ...(cursor?.createdAt && { createdAt: cursor?.createdAt }),
            ...(cursor?.updatedAt && { updatedAt: cursor?.updatedAt }),
          },
        }),
        where: {
          email: { contains: email },
          nickname: { contains: nickname },
          isEmailVerified,
        },
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

      this.prisma.user.count({
        where: {
          email: { contains: email },
          nickname: { contains: nickname },
          isEmailVerified,
        },
      }),
    ]);

    return [users.map((user) => this.userMapper.toEntity(user)), count];
  }
}
