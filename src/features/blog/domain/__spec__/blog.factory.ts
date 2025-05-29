import { faker } from '@faker-js/faker/.';
import { TestDB } from '@libs/db/types/__spec__/db.type';
import { generateEntityId } from '@libs/ddd/entity.base';
import { Factory } from 'fishery';
import { BlogEntity } from '../blog.entity';

class BlogFactory extends Factory<
  BlogEntity,
  unknown,
  BlogEntity,
  Partial<ReturnType<BlogEntity['getProps']>>
> {
  async buildAndInsert(
    db: TestDB,
    params?: Partial<ReturnType<BlogEntity['getProps']>>,
  ): Promise<BlogEntity> {
    const blog = this.build(params);
    const props = blog.getProps();

    await db.tx.blog.create({
      data: {
        id: props.id,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        createdBy: props.createdBy,
        connectionId: props.connectionId,
        name: props.name,
        description: props.description,
        dDayStartDate: props.dDayStartDate,
        backgroundImagePath: props.backgroundImagePath,
        memberIds: props.memberIds,
        deletedAt: props.deletedAt,
      },
    });

    return blog;
  }
}

export const blogFactory = BlogFactory.define(({ params }) => {
  return new BlogEntity({
    id: params.id ?? generateEntityId(),
    createdAt: params.createdAt ?? faker.date.past({ years: 1 }),
    updatedAt: params.updatedAt ?? faker.date.recent(),
    props: {
      createdBy: params.createdBy ?? generateEntityId(),
      connectionId: params.connectionId ?? generateEntityId(),
      name:
        params.name ??
        faker.string.nanoid({
          min: BlogEntity.BLOG_NAME_LENGTH.MIN,
          max: BlogEntity.BLOG_NAME_LENGTH.MAX,
        }),
      description:
        params.description ??
        faker.string.nanoid({
          min: BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN,
          max: BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX,
        }),
      dDayStartDate:
        params.dDayStartDate ??
        faker.date.past({ years: 1 }).toISOString().split('T')[0],
      backgroundImagePath: params.backgroundImagePath ?? null,
      memberIds: params.memberIds ??
        params.members?.map((member) => member.id) ?? [
          generateEntityId(),
          generateEntityId(),
        ],
      ...(params.members && { members: params.members }),
      deletedAt: params.deletedAt ?? null,
    },
  });
});
