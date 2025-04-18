import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import type { BlogPostCommentProps } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity-interface';
import { baseSchema } from '@libs/db/base.schema';
import type { CreateEntityProps } from '@libs/ddd/entity.base';
import type { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

export const blogPostCommentSchema = baseSchema.extend({
  blogPostId: z.bigint(),
  userId: z.bigint(),
  content: z.string().max(255),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type BlogPostCommentModel = z.TypeOf<typeof blogPostCommentSchema>;

@Injectable()
export class BlogPostCommentMapper
  implements
    Omit<Mapper<BlogPostCommentEntity, BlogPostCommentModel>, 'toResponseDto'>
{
  toEntity(record: BlogPostCommentModel): BlogPostCommentEntity {
    const props: CreateEntityProps<BlogPostCommentProps> = {
      id: record.id,
      props: {
        blogPostId: record.blogPostId,
        userId: record.userId,
        content: record.content,
        deletedAt: record.deletedAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new BlogPostCommentEntity(props);
  }

  toPersistence(entity: BlogPostCommentEntity): BlogPostCommentModel {
    return blogPostCommentSchema.parse({
      ...entity.getProps(),
    });
  }
}
