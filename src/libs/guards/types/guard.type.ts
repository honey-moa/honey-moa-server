import type { GuardType } from '@libs/guards/types/guard.constant';
import type { ValueOf } from '@libs/types/type';

export type GuardTypeUnion = ValueOf<typeof GuardType>;
