import { RepositoryPort } from '@libs/ddd/repository.port';
import { AggregateID } from '@libs/ddd/entity.base';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';

export interface UserConnectionRepositoryPort
  extends RepositoryPort<UserConnectionEntity> {
  findOneByIdAndStatus(
    id: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined>;
  findOneByUserIdAndStatus(
    userId: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined>;
}
