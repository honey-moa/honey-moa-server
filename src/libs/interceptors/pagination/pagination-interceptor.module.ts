import { Module } from '@nestjs/common';
import { PaginationResponseBuilder } from '@libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { PaginationInterceptor } from '@libs/interceptors/pagination/pagination.interceptor';

@Module({
  providers: [PaginationInterceptor, PaginationResponseBuilder],
})
export class PaginationInterceptorModule {}
