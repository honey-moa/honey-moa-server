import { UserRole, UserLoginType } from '@src/apis/user/types/user.constant';
import { ValueOf } from '@src/libs/types/type';

export type UserRoleUnion = ValueOf<typeof UserRole>;
export type UserLoginTypeUnion = ValueOf<typeof UserLoginType>;
