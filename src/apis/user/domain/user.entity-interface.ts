import { UserEmailVerifyTokenEntity } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import type {
  UserMbtiUnion,
  UserRoleUnion,
} from '@src/apis/user/types/user.type';

export interface UserProps {
  name: string;
  nickname: string;
  role: UserRoleUnion;
  isEmailVerified: boolean;
  mbti: UserMbtiUnion | null;
  deletedAt: Date | null;

  loginCredential: LoginCredential;

  userEmailVerifyToken?: UserEmailVerifyTokenEntity;
}

export interface CreateUserProps {
  name: string;
  nickname: string;
  mbti: UserMbtiUnion | null;

  loginCredential: LoginCredential;
}

export interface UpdateLoginCredentialProps {
  password?: string;
}
