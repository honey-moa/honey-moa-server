import type { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import type { UserEntity } from '@features/user/domain/user.entity';
import type { UserLoginTypeUnion } from '@features/user/types/user.type';
import type { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import type { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface UserInclude {
  userVerifyTokens?: boolean;
  requestedConnections?: boolean;
  requesterConnections?: boolean;
}

export interface UserRepositoryPort
  extends RepositoryPort<UserEntity, UserInclude> {
  findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  findOneUserByIdAndConnectionId(
    userId: AggregateID,
    userConnectionId: AggregateID,
    status?: UserConnectionStatusUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  findByIds(ids: AggregateID[], include?: UserInclude): Promise<UserEntity[]>;

  createUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  updateUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  createUserConnection(entity: UserConnectionEntity): Promise<void>;

  updateUserConnection(
    entity: UserEntity,
    userConnection: UserConnectionEntity,
  ): Promise<void>;
}
