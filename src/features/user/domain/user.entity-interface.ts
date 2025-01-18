import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import type {
  UserLoginTypeUnion,
  UserMbtiUnion,
  UserRoleUnion,
} from '@features/user/types/user.type';
import { BaseEntityProps } from '@libs/ddd/entity.base';

export interface UserProps {
  nickname: string;
  role: UserRoleUnion;
  email: string;
  password: string;
  loginType: UserLoginTypeUnion;
  isEmailVerified: boolean;
  mbti: UserMbtiUnion | null;
  deletedAt: Date | null;

  userVerifyTokens?: UserVerifyTokenEntity[];
  requestedConnection?: UserConnectionEntity;
  requesterConnection?: UserConnectionEntity;
}

export interface CreateUserProps {
  nickname: string;
  email: string;
  password: string;
  loginType: UserLoginTypeUnion;
  mbti: UserMbtiUnion | null;
}

export interface HydratedUserEntityProps extends BaseEntityProps {
  nickname: string;
}
