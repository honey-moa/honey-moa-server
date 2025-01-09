import { SetMetadata } from '@nestjs/common';
import { SET_PAGINATION } from '@src/libs/interceptors/pagination/types/pagination-interceptor.constant';

export const SetPagination = () => {
  return SetMetadata(SET_PAGINATION, true);
};
