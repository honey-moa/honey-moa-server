import { RepositoryPort } from '@libs/ddd/repository.port';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserInclude {
  userVerifyTokens?: boolean;
  requestedConnection?: boolean;
  requesterConnection?: boolean;
}

export interface UserRepositoryPort
  extends RepositoryPort<UserEntity, UserInclude> {
  findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  findOneUserConnectionById(
    userConnectionId: AggregateID,
    include?: UserInclude,
  ): Promise<UserConnectionEntity | undefined>;

  findByIds(ids: AggregateID[], include?: UserInclude): Promise<UserEntity[]>;

  createUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  updateUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  createUserConnection(entity: UserConnectionEntity): Promise<void>;

  updateUserConnection(entity: UserConnectionEntity): Promise<void>;
}
