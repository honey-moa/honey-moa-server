import { GuardType } from '@src/libs/guards/types/guard.constant';
import { ValueOf } from '@src/libs/types/type';

export type GuardTypeUnion = ValueOf<typeof GuardType>;
