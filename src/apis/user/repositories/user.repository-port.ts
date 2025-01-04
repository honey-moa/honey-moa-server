import { RepositoryPort } from '@libs/ddd/repository.port';
import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';

export interface UserInclude {
  userVerifyTokens?: boolean;
}

export interface UserRepositoryPort
  extends RepositoryPort<UserEntity, UserInclude> {
  findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  createUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  updateUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;
}
