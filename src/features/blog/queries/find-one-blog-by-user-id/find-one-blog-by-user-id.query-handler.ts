import { BlogEntity } from '@features/blog/domain/blog.entity';
import { FindOneBlogByUserIdQuery } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindOneBlogByUserIdQuery)
export class FindOneBlogByUserIdQueryHandler
  implements IQueryHandler<FindOneBlogByUserIdQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindOneBlogByUserIdQuery) {
    const { userId } = query;

    const blog = await this.txHost.tx.blog.findFirst({
      where: {
        connection: {
          status: UserConnectionStatus.ACCEPTED,
          OR: [
            {
              requestedId: userId,
            },
            {
              requesterId: userId,
            },
          ],
        },
      },
      include: {
        connection: {
          include: {
            requesterUser: true,
            requestedUser: true,
          },
        },
      },
    });

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      dDayStartDate: blog.dDayStartDate,
      backgroundImageUrl: blog.backgroundImagePath
        ? `${BlogEntity.BLOG_ATTACHMENT_URL}/${blog.backgroundImagePath}`
        : null,
      connectionId: blog.connectionId,
      createdBy: blog.createdBy,
      memberIds: blog.memberIds,
      members: [
        {
          ...blog.connection.requesterUser,
          profileImageUrl: `${UserEntity.USER_ATTACHMENT_URL}/${blog.connection.requesterUser.profileImagePath}`,
        },
        {
          ...blog.connection.requestedUser,
          profileImageUrl: `${UserEntity.USER_ATTACHMENT_URL}/${blog.connection.requestedUser.profileImagePath}`,
        },
      ],
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }
}
