import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { isNil } from '@libs/utils/util';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { FindOneUserQuery } from '@features/user/queries/find-one-user/find-one-user.query';
import { UserEntity } from '@features/user/domain/user.entity';

@QueryHandler(FindOneUserQuery)
export class FindOneUserQueryHandler
  implements IQueryHandler<FindOneUserQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindOneUserQuery) {
    const { userId } = query;

    const user = await this.txHost.tx.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return {
      ...user,
      profileImageUrl: user.profileImagePath
        ? `${UserEntity.USER_ATTACHMENT_URL}/${user.profileImagePath}`
        : null,
    };
  }
}
