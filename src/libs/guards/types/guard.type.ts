import { GuardType } from '@libs/guards/types/guard.constant';
import { ValueOf } from '@libs/types/type';

export type GuardTypeUnion = ValueOf<typeof GuardType>;
