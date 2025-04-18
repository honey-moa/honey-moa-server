import { PaginationResponseBuilder } from '@libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { PaginationInterceptor } from '@libs/interceptors/pagination/pagination.interceptor';
import { Module } from '@nestjs/common';

@Module({
  providers: [PaginationInterceptor, PaginationResponseBuilder],
})
export class PaginationInterceptorModule {}
