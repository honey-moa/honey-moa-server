import { RepositoryPort } from '@libs/ddd/repository.port';
import { UserEmailVerifyTokenEntity } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
  ): Promise<UserEntity | undefined>;

  createUserEmailVerifyToken(entity: UserEmailVerifyTokenEntity): Promise<void>;

  updateUserEmailVerifyToken(entity: UserEmailVerifyTokenEntity): Promise<void>;

  findOneUserWithUserEmailVerifyTokenById(
    userId: AggregateID,
  ): Promise<UserEntity | undefined>;
}
