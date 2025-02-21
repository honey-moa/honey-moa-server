import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { FindPublicBlogPostsQuery } from '@features/blog-post/queries/find-public-blog-posts/find-public-blog-posts.query';
import { UserEntity } from '@features/user/domain/user.entity';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindPublicBlogPostsQuery)
export class FindPublicBlogPostsQueryHandler
  implements IQueryHandler<FindPublicBlogPostsQuery>
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async execute(query: FindPublicBlogPostsQuery) {
    const { skip, take, title, cursor, orderBy } = query;

    const whereProps = {
      title: {
        contains: title,
      },
      isPublic: true,
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

    const [blogPosts, count] = await Promise.all([
      this.txHost.tx.blogPost.findMany({
        where: whereProps,
        skip,
        take,
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
        include: {
          blog: {
            include: {
              connection: {
                include: {
                  requestedUser: true,
                  requesterUser: true,
                },
              },
            },
          },
          blogPostTags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.txHost.tx.blogPost.count({
        where: whereProps,
      }),
    ]);

    return {
      blogPosts: blogPosts.map((blogPost) => {
        return {
          ...blogPost,
          tags: blogPost.blogPostTags.map((blogPostTag) => blogPostTag.tag),
          thumbnailImageUrl: `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/${blogPost.thumbnailImagePath}`,
          blog: {
            ...blogPost.blog,
            members: [
              {
                ...blogPost.blog.connection.requestedUser,
                profileImageUrl: blogPost.blog.connection.requestedUser
                  .profileImagePath
                  ? `${UserEntity.USER_ATTACHMENT_URL}/${blogPost.blog.connection.requestedUser.profileImagePath}`
                  : null,
              },
              {
                ...blogPost.blog.connection.requesterUser,
                profileImageUrl: blogPost.blog.connection.requesterUser
                  .profileImagePath
                  ? `${UserEntity.USER_ATTACHMENT_URL}/${blogPost.blog.connection.requesterUser.profileImagePath}`
                  : null,
              },
            ],
          },
        };
      }),
      count,
    };
  }
}
