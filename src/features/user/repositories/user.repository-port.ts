import { RepositoryPort } from '@libs/ddd/repository.port';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserLoginTypeUnion } from '@features/user/types/user.type';
import { AggregateID } from '@libs/ddd/entity.base';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';

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

  updateUserConnection(entity: UserConnectionEntity): Promise<void>;
}
