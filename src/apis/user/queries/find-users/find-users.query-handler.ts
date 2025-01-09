import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { FindUsersQuery } from '@src/apis/user/queries/find-users/find-users.query';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { Paginated } from '@src/libs/types/type';

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
