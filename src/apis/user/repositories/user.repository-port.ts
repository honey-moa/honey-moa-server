import { RepositoryPort } from '@libs/ddd/repository.port';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findOneByEmailAndLoginType: (
    email: string,
    loginType: UserLoginTypeUnion,
  ) => Promise<UserEntity | undefined>;
}
