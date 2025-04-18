import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { ValueOf } from '@libs/types/type';

export type UserConnectionStatusUnion = ValueOf<typeof UserConnectionStatus>;
