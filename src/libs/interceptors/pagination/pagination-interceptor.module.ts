import { Module } from '@nestjs/common';
import { PaginationResponseBuilder } from '@src/libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { PaginationInterceptor } from '@src/libs/interceptors/pagination/pagination.interceptor';

@Module({
  providers: [PaginationInterceptor, PaginationResponseBuilder],
})
export class PaginationInterceptorModule {}
