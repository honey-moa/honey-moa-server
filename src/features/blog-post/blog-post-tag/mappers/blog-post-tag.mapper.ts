import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { BlogPostTagProps } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity-interface';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { z } from 'zod';

export const blogPostTagSchema = baseSchema.extend({
  blogPostId: z.bigint(),
  tagId: z.bigint(),
});

export type BlogPostTagModel = z.TypeOf<typeof blogPostTagSchema>;

export class BlogPostTagMapper
  implements Omit<Mapper<BlogPostTagEntity, BlogPostTagModel>, 'toResponseDto'>
{
  constructor() {}

  toEntity(record: BlogPostTagModel): BlogPostTagEntity {
    const props: CreateEntityProps<BlogPostTagProps> = {
      id: record.id,
      props: {
        blogPostId: record.blogPostId,
        tagId: record.tagId,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new BlogPostTagEntity(props);
  }

  toPersistence(entity: BlogPostTagEntity): BlogPostTagModel {
    return blogPostTagSchema.parse({
      ...entity.getProps(),
    });
  }
}
