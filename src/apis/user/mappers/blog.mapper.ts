import { BlogEntity } from '@src/apis/user/domain/user-connection/blog/blog.entity';
import { BlogProps } from '@src/apis/user/domain/user-connection/blog/blog.entity-interface';
import { BlogResponseDto } from '@src/apis/user/dtos/user-connection/blog/response/blog.response-dto';
import { baseSchema } from '@src/libs/db/base.schema';
import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { Mapper } from '@src/libs/ddd/mapper.interface';
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
