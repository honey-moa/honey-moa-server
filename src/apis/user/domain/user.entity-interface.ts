import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import type { UserRoleUnion } from '@src/apis/user/types/user.type';

export interface UserProps {
  name: string;
  role: UserRoleUnion;
  deletedAt: Date | null;

  loginCredential: LoginCredential;
}

export interface CreateUserProps {
  name: string;

  loginCredential: LoginCredential;
}

export interface UpdateLoginCredentialProps {
  password?: string;
}
