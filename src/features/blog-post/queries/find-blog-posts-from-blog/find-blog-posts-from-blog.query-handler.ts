import { FindBlogPostsFromBlogQuery } from '@features/blog-post/queries/find-blog-posts-from-blog/find-blog-posts-from-blog.query';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import dayjs from 'dayjs';

@QueryHandler(FindBlogPostsFromBlogQuery)
export class FindBlogPostsFromBlogQueryHandler
  implements IQueryHandler<FindBlogPostsFromBlogQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindBlogPostsFromBlogQuery) {
    const {
      userId,
      blogId,
      title,
      datePeriod,
      showPrivatePosts,
      orderBy,
      skip,
      take,
      cursor,
    } = query;

    const blog = await this.txHost.tx.blog.findUnique({
      where: {
        id: blogId,
        deletedAt: null,
      },
    });

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (
      showPrivatePosts &&
      (isNil(userId) || !blog.memberIds.includes(userId))
    ) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const where = {
      blogId,
      deletedAt: null,
      title: { contains: title },
      ...(!showPrivatePosts && {
        isPublic: true,
      }),
      ...this.getWhereFromDatePeriod(datePeriod),
    };

    const [blogPosts, count] = await Promise.all([
      this.txHost.tx.blogPost.findMany({
        ...(cursor?.id && {
          cursor: {
            id: cursor?.id,
            ...(cursor?.createdAt && { createdAt: cursor?.createdAt }),
            ...(cursor?.updatedAt && { updatedAt: cursor?.updatedAt }),
          },
        }),
        where,
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
        include: {
          blogPostTags: {
            include: {
              tag: true,
            },
          },
        },
      }),

      this.txHost.tx.blogPost.count({
        where,
      }),
    ]);

    return {
      blogPosts: blogPosts.map((blogPost) => {
        return {
          ...blogPost,
          tags: blogPost.blogPostTags.map((blogPostTag) => blogPostTag.tag),
        };
      }),
      count,
    };
  }

  private getWhereFromDatePeriod(datePeriod?: string) {
    if (isNil(datePeriod)) {
      return {};
    }

    const timestamp = Date.parse(datePeriod);

    if (Number.isNaN(timestamp)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        customMessage: "datePeriod isn't valid date format.",
      });
    }

    const date = dayjs(datePeriod);

    if (datePeriod.length === 4) {
      return {
        createdAt: {
          gte: date.startOf('year').toDate(),
          lte: date.endOf('year').toDate(),
        },
      };
    }

    if (datePeriod.length === 7) {
      return {
        createdAt: {
          gte: date.startOf('month').toDate(),
          lte: date.endOf('month').toDate(),
        },
      };
    }

    if (datePeriod.length === 10) {
      return {
        createdAt: {
          gte: date.startOf('day').toDate(),
          lte: date.endOf('day').toDate(),
        },
      };
    }

    return {};
  }
}
