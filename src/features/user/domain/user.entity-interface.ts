import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import type {
  UserLoginTypeUnion,
  UserMbtiUnion,
  UserRoleUnion,
} from '@features/user/types/user.type';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { BaseEntityProps } from '@libs/ddd/entity.base';

export interface UserProps {
  nickname: string;
  role: UserRoleUnion;
  email: string;
  password: string;
  loginType: UserLoginTypeUnion;
  isEmailVerified: boolean;
  profileImagePath: string | null;
  mbti: UserMbtiUnion | null;
  deletedAt: Date | null;

  userVerifyTokens?: UserVerifyTokenEntity[];
  requestedConnections?: UserConnectionEntity[];
  requesterConnections?: UserConnectionEntity[];
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
  profileImageUrl: string | null;
}
