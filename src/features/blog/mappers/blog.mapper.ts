import { BlogEntity } from '@features/blog/domain/blog.entity';
import { BlogProps } from '@features/blog/domain/blog.entity-interface';
import { BlogResponseDto } from '@features/blog/dtos/response/blog.response-dto';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { z } from 'zod';

export const blogSchema = baseSchema.extend({
  createdBy: z.bigint(),
  connectionId: z.bigint(),
  name: z.string().max(30),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type BlogModel = z.TypeOf<typeof blogSchema>;

export class BlogMapper
  implements Mapper<BlogEntity, BlogModel, BlogResponseDto>
{
  constructor() {}

  toEntity(blog: BlogModel): BlogEntity {
    const props: CreateEntityProps<BlogProps> = {
      id: blog.id,
      props: {
        connectionId: blog.connectionId,
        createdBy: blog.createdBy,
        name: blog.name,
        deletedAt: blog.deletedAt,
      },
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };

    return new BlogEntity(props);
  }

  toPersistence(entity: BlogEntity): BlogModel {
    return blogSchema.parse({
      ...entity.getProps(),
    });
  }

  toResponseDto(entity: BlogEntity): BlogResponseDto {
    return new BlogResponseDto({
      ...entity.getProps(),
    });
  }
}
