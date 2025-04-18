import type { PaginationBy } from '@libs/interceptors/pagination/types/pagination-interceptor.enum';

export type PaginationInterceptorArgs =
  | PaginationBy.Cursor
  | PaginationBy.Offset;
