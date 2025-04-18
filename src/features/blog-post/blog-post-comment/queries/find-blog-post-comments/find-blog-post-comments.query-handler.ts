import { FindBlogPostCommentsQuery } from '@features/blog-post/blog-post-comment/queries/find-blog-post-comments/find-blog-post-comments.query';
import { UserEntity } from '@features/user/domain/user.entity';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindBlogPostCommentsQuery)
export class FindBlogPostCommentsQueryHandler
  implements IQueryHandler<FindBlogPostCommentsQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindBlogPostCommentsQuery) {
    const { userId, blogPostId, skip, take, orderBy, cursor } = query;

    const blogPost = await this.txHost.tx.blogPost.findUnique({
      where: {
        id: blogPostId,
        deletedAt: null,
      },
      include: {
        blog: true,
      },
    });

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (
      !blogPost.isPublic &&
      (isNil(userId) || !blogPost.blog.memberIds.includes(userId))
    ) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const where = {
      blogPostId,
      deletedAt: null,
    };

    const [blogPostComments, count] = await Promise.all([
      this.txHost.tx.blogPostComment.findMany({
        where,
        ...(cursor?.id && {
          cursor: {
            id: cursor?.id,
          },
        }),
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
        include: {
          user: true,
        },
        skip,
        take,
      }),

      this.txHost.tx.blogPostComment.count({
        where,
      }),
    ]);

    return {
      blogPostComments: blogPostComments.map((blogPostComment) => {
        return {
          ...blogPostComment,
          user: {
            ...blogPostComment.user,
            profileImageUrl: blogPostComment.user.profileImagePath
              ? `${UserEntity.USER_ATTACHMENT_URL}/${blogPostComment.user.profileImagePath}`
              : null,
          },
        };
      }),
      count,
    };
  }
}
