import { faker } from '@faker-js/faker/.';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { TestDB } from '@libs/db/types/__spec__/db.type';
import { generateEntityId } from '@libs/ddd/entity.base';
import { Factory } from 'fishery';

class UserConnectionFactory extends Factory<
  UserConnectionEntity,
  unknown,
  UserConnectionEntity,
  Partial<ReturnType<UserConnectionEntity['getProps']>>
> {
  async buildAndInsert(
    db: TestDB,
    params?: Partial<ReturnType<UserConnectionEntity['getProps']>>,
  ): Promise<UserConnectionEntity> {
    const userConnection = this.build(params);
    const props = userConnection.getProps();

    await db.tx.userConnection.create({
      data: {
        id: props.id,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        requestedId: props.requestedId,
        requesterId: props.requesterId,
        status: props.status,
        deletedAt: props.deletedAt,
      },
    });

    return userConnection;
  }
}

export const userConnectionFactory = UserConnectionFactory.define(
  ({ params }) => {
    return new UserConnectionEntity({
      id: params.id ?? generateEntityId(),
      createdAt:
        params.createdAt ??
        faker.date.past({
          years: 1,
        }),
      updatedAt: params.updatedAt ?? faker.date.recent(),
      props: {
        requestedId:
          params.requestedId ?? params.requestedUser?.id ?? generateEntityId(),
        requesterId:
          params.requesterId ?? params.requesterUser?.id ?? generateEntityId(),
        ...(params.requesterUser && { requesterUser: params.requesterUser }),
        ...(params.requestedUser && { requestedUser: params.requestedUser }),
        status: params.status ?? UserConnectionStatus.PENDING,
        deletedAt: params.deletedAt ?? null,
      },
    });
  },
);
