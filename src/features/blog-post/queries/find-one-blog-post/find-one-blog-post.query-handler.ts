import { FindOneBlogPostQuery } from '@features/blog-post/queries/find-one-blog-post/find-one-blog-post.query';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindOneBlogPostQuery)
export class FindOneBlogPostQueryHandler
  implements IQueryHandler<FindOneBlogPostQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindOneBlogPostQuery) {
    const { blogPostId, userId } = query;

    const blogPost = await this.txHost.tx.blogPost.findUnique({
      where: {
        id: blogPostId,
        deletedAt: null,
      },
      include: {
        blog: {
          include: {
            connection: true,
          },
        },
        blogPostTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const { connection } = blogPost.blog;

    if (!blogPost.isPublic) {
      if (
        connection.requestedId !== userId ||
        connection.requestedId !== userId
      ) {
        throw new HttpForbiddenException({
          code: COMMON_ERROR_CODE.PERMISSION_DENIED,
        });
      }
    }

    return {
      id: blogPost.id,
      blogId: blogPost.blogId,
      userId: blogPost.userId,
      title: blogPost.title,
      contents: blogPost.contents,
      date: blogPost.date,
      location: blogPost.location,
      isPublic: blogPost.isPublic,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
      tags: blogPost.blogPostTags.map((blogPostTag) => {
        return {
          id: blogPostTag.tag.id,
          name: blogPostTag.tag.name,
          createdAt: blogPostTag.tag.createdAt,
          updatedAt: blogPostTag.tag.updatedAt,
        };
      }),
    };
  }
}
