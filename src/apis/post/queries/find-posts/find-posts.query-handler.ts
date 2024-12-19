import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostModel } from '@src/apis/post/mappers/post.mapper';
import { FindPostsQuery } from '@src/apis/post/queries/find-posts/find-posts.query';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { Paginated } from '@src/libs/types/type';

@QueryHandler(FindPostsQuery)
export class FindPostsQueryHandler
  implements IQueryHandler<FindPostsQuery, Paginated<PostModel>>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  execute(query: FindPostsQuery): Promise<Paginated<PostModel>> {
    const { title, body, skip, take, orderBy } = query;

    const where = {
      title,
      body,
    };

    return Promise.all([
      this.txHost.tx.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: true,
        },
      }),
      this.txHost.tx.post.count({
        where,
      }),
    ]);
  }
}
