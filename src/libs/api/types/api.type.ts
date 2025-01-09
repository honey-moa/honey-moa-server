import { SortOrder } from '@src/libs/api/types/api.constant';
import { ValueOf } from '@src/libs/types/type';

export type SortOrderUnion = ValueOf<typeof SortOrder>;

export type OrderBy<T extends Record<string, any>> = {
  [key in keyof T]?: SortOrderUnion;
};

export type CursorBy<T extends Record<string, any>, K extends keyof T> = {
  [key in keyof T]: key extends K ? T[key] : T[key] | undefined;
};
