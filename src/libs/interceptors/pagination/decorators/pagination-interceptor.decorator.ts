import { SetMetadata } from '@nestjs/common';
import { SET_PAGINATION } from '@src/libs/interceptors/pagination/types/pagination-interceptor.constant';
import { PaginationInterceptorArgs } from '@src/libs/interceptors/pagination/types/pagination-interceptor.type';

export const SetPagination = (args: PaginationInterceptorArgs) => {
  return SetMetadata(SET_PAGINATION, args);
};
