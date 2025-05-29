import { faker } from '@faker-js/faker/.';
import { UserEntity } from '@features/user/domain/user.entity';
import {
  UserLoginType,
  UserMbti,
  UserRole,
} from '@features/user/types/user.constant';
import { TestDB } from '@libs/db/types/__spec__/db.type';
import { generateEntityId } from '@libs/ddd/entity.base';
import { Factory } from 'fishery';

class UserFactory extends Factory<
  UserEntity,
  unknown,
  UserEntity,
  Partial<ReturnType<UserEntity['getProps']>>
> {
  async buildAndInsert(
    db: TestDB,
    params?: Partial<ReturnType<UserEntity['getProps']>>,
  ): Promise<UserEntity> {
    const user = this.build(params);
    const props = user.getProps();

    await db.tx.user.create({
      data: {
        id: props.id,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        nickname: props.nickname,
        email: props.email,
        password: props.password,
        loginType: props.loginType,
        mbti: props.mbti,
        deletedAt: props.deletedAt,
        role: props.role,
        isEmailVerified: props.isEmailVerified,
        profileImagePath: props.profileImagePath,
      },
    });

    return user;
  }

  async buildListAndInsert(
    db: TestDB,
    number: number,
    params?: Partial<ReturnType<UserEntity['getProps']>>,
  ): Promise<UserEntity[]> {
    const users = this.buildList(number, params);

    await db.tx.user.createMany({
      data: users.map((user) => user.getProps()),
    });

    return users;
  }
}

export const userFactory = UserFactory.define(({ params }) => {
  return new UserEntity({
    id: params.id ?? generateEntityId(),
    createdAt: params.createdAt ?? faker.date.past({ years: 1 }),
    updatedAt: params.updatedAt ?? faker.date.recent(),
    props: {
      nickname: params.nickname ?? faker.string.nanoid(10),
      email: params.email ?? faker.internet.email(),
      password: params.password ?? faker.internet.password(),
      loginType: params.loginType ?? faker.helpers.enumValue(UserLoginType),
      mbti: params.mbti ?? faker.helpers.enumValue(UserMbti),
      deletedAt: params.deletedAt ?? null,
      role: params.role ?? UserRole.USER,
      isEmailVerified: params.isEmailVerified ?? false,
      profileImagePath: params.profileImagePath ?? null,
    },
  });
});
