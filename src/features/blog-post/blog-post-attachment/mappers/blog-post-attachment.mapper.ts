import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostAttachmentProps } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity-interface';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { z } from 'zod';

export const blogPostAttachmentSchema = baseSchema.extend({
  blogPostId: z.bigint(),
  attachmentId: z.bigint(),
});

export type BlogPostAttachmentModel = z.TypeOf<typeof blogPostAttachmentSchema>;

export class BlogPostAttachmentMapper
  implements
    Omit<
      Mapper<BlogPostAttachmentEntity, BlogPostAttachmentModel>,
      'toResponseDto'
    >
{
  toEntity(record: BlogPostAttachmentModel): BlogPostAttachmentEntity {
    const props: CreateEntityProps<BlogPostAttachmentProps> = {
      id: record.id,
      props: {
        blogPostId: record.blogPostId,
        attachmentId: record.attachmentId,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new BlogPostAttachmentEntity(props);
  }

  toPersistence(entity: BlogPostAttachmentEntity): BlogPostAttachmentModel {
    return blogPostAttachmentSchema.parse({
      ...entity.getProps(),
    });
  }
}
