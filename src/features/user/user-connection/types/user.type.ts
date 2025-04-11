import type { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import type { ValueOf } from '@libs/types/type';

export type UserConnectionStatusUnion = ValueOf<typeof UserConnectionStatus>;
