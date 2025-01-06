import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import type {
  UserLoginTypeUnion,
  UserMbtiUnion,
  UserRoleUnion,
} from '@src/apis/user/types/user.type';

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
}

export interface CreateUserProps {
  nickname: string;
  email: string;
  password: string;
  loginType: UserLoginTypeUnion;
  mbti: UserMbtiUnion | null;
}
