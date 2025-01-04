import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import type {
  UserMbtiUnion,
  UserRoleUnion,
} from '@src/apis/user/types/user.type';

export interface UserProps {
  nickname: string;
  role: UserRoleUnion;
  isEmailVerified: boolean;
  mbti: UserMbtiUnion | null;
  deletedAt: Date | null;

  loginCredential: LoginCredential;

  userVerifyTokens?: UserVerifyTokenEntity[];
}

export interface CreateUserProps {
  nickname: string;
  mbti: UserMbtiUnion | null;

  loginCredential: LoginCredential;
}

export interface UpdateLoginCredentialProps {
  password?: string;
}
