import { Module } from '@nestjs/common';
import { ContextInterceptorModule } from '@src/libs/interceptors/context/context-interceptor.module';
import { PaginationInterceptorModule } from '@src/libs/interceptors/pagination/pagination-interceptor.module';

@Module({
  imports: [PaginationInterceptorModule, ContextInterceptorModule],
})
export class InterceptorsModule {}
