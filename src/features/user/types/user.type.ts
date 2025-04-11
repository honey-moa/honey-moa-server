import {
  UserLoginType,
  UserMbti,
  UserRole,
  UserVerifyTokenType,
} from '@features/user/types/user.constant';
import { ValueOf } from '@libs/types/type';

export type UserRoleUnion = ValueOf<typeof UserRole>;
export type UserLoginTypeUnion = ValueOf<typeof UserLoginType>;
export type UserMbtiUnion = ValueOf<typeof UserMbti>;
export type UserVerifyTokenTypeUnion = ValueOf<typeof UserVerifyTokenType>;
