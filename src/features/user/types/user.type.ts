import {
  UserRole,
  UserLoginType,
  UserMbti,
  UserVerifyTokenType,
  UserConnectionStatus,
} from '@features/user/types/user.constant';
import { ValueOf } from '@libs/types/type';

export type UserRoleUnion = ValueOf<typeof UserRole>;
export type UserLoginTypeUnion = ValueOf<typeof UserLoginType>;
export type UserMbtiUnion = ValueOf<typeof UserMbti>;
export type UserVerifyTokenTypeUnion = ValueOf<typeof UserVerifyTokenType>;
export type UserConnectionStatusUnion = ValueOf<typeof UserConnectionStatus>;
