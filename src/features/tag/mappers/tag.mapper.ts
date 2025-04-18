import { TagEntity } from '@features/tag/domain/tag.entity';
import { TagProps } from '@features/tag/domain/tag.entity-interface';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { z } from 'zod';

export const tagSchema = baseSchema.extend({
  name: z.string().max(30),
  userId: z.bigint(),
});

export type TagModel = z.TypeOf<typeof tagSchema>;

export class TagMapper
  implements Omit<Mapper<TagEntity, TagModel>, 'toResponseDto'>
{
  toEntity(tag: TagModel): TagEntity {
    const props: CreateEntityProps<TagProps> = {
      id: tag.id,
      props: {
        name: tag.name,
        userId: tag.userId,
      },
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };

    return new TagEntity(props);
  }

  toPersistence(entity: TagEntity): TagModel {
    return tagSchema.parse({
      ...entity.getProps(),
    });
  }
}
