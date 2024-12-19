import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

export class FindOneUserQuery implements IQuery {
  readonly id: bigint;

  constructor(props: FindOneUserQuery) {
    const { id } = props;

    this.id = id;
  }
}

@QueryHandler(FindOneUserQuery)
export class FindOneUserQueryHandler
  implements IQueryHandler<FindOneUserQuery>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: FindOneUserQuery): Promise<UserEntity> {
    const { id } = query;

    const existUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existUser) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return this.userMapper.toEntity(existUser);
  }
}
