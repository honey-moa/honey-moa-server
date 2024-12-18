import { PaginationBy } from '@src/libs/interceptors/pagination/types/pagination-interceptor.enum';

export type PaginationInterceptorArgs =
  | PaginationBy.Cursor
  | PaginationBy.Offset;
