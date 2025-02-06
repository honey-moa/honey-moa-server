import {
  BlogPostAttachmentMapper,
  blogPostAttachmentSchema,
} from '@features/blog-post/blog-post-attachment/mappers/blog-post-attachment.mapper';
import {
  BlogPostTagMapper,
  blogPostTagSchema,
} from '@features/blog-post/blog-post-tag/mappers/blog-post-tag.mapper';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { BlogPostProps } from '@features/blog-post/domain/blog-post.entity-interface';
import {
  BlogPostResponseDto,
  CreateBlogPostResponseDtoProps,
} from '@features/blog-post/dtos/response/blog-post.response-dto';
import { HydratedTagResponseDto } from '@features/tag/dtos/response/hydrated-tag.response-dto';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { isNil } from '@libs/utils/util';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

export const blogPostSchema = baseSchema.extend({
  blogId: z.bigint(),
  userId: z.bigint(),
  title: z.string().max(255),
  contents: z.array(z.record(z.any())),
  date: z.string().max(20),
  location: z.string().max(100),
  isPublic: z.boolean(),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export const blogPostWithEntitiesSchema = blogPostSchema.extend({
  blogPostTags: z.array(blogPostTagSchema).optional(),
  blogPostAttachments: z.array(blogPostAttachmentSchema).optional(),
});

export type BlogPostModel = z.TypeOf<typeof blogPostSchema>;

export type BlogPostWithEntitiesModel = z.TypeOf<
  typeof blogPostWithEntitiesSchema
>;

@Injectable()
export class BlogPostMapper
  implements Mapper<BlogPostEntity, BlogPostModel, BlogPostResponseDto>
{
  constructor(
    private readonly blogPostTagMapper: BlogPostTagMapper,
    private readonly blogPostAttachmentMapper: BlogPostAttachmentMapper,
  ) {}

  toEntity(record: BlogPostWithEntitiesModel): BlogPostEntity {
    const blogPostProps: CreateEntityProps<BlogPostProps> = {
      id: record.id,
      props: {
        isPublic: record.isPublic,
        blogId: record.blogId,
        userId: record.userId,
        title: record.title,
        contents: record.contents,
        date: record.date,
        location: record.location,
        deletedAt: record.deletedAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (!isNil(record.blogPostTags)) {
      blogPostProps.props.blogPostTags = record.blogPostTags.map((tag) =>
        this.blogPostTagMapper.toEntity(tag),
      );
    }

    if (!isNil(record.blogPostAttachments)) {
      blogPostProps.props.blogPostAttachments = record.blogPostAttachments.map(
        (attachment) => this.blogPostAttachmentMapper.toEntity(attachment),
      );
    }

    return new BlogPostEntity(blogPostProps);
  }

  toPersistence(entity: BlogPostEntity): BlogPostModel {
    // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    const { blogPostAttachments, tags, blogPostTags, ...props } =
      entity.getProps();

    return blogPostSchema.parse({
      ...props,
    });
  }

  toResponseDto(entity: BlogPostEntity): BlogPostResponseDto {
    const { tags, ...props } = entity.getProps();

    const createDtoProps: CreateBlogPostResponseDtoProps = {
      ...props,
    };

    if (!isNil(tags)) {
      createDtoProps.tags = tags.map((tag) => new HydratedTagResponseDto(tag));
    }

    return new BlogPostResponseDto(createDtoProps);
  }
}
