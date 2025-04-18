import { SET_PAGINATION } from '@libs/interceptors/pagination/types/pagination-interceptor.constant';
import { SetMetadata } from '@nestjs/common';

export const SetPagination = () => {
  return SetMetadata(SET_PAGINATION, true);
};
