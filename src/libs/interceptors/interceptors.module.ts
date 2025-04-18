import { ContextInterceptorModule } from '@libs/interceptors/context/context-interceptor.module';
import { RequestResponseLoggingInterceptorModule } from '@libs/interceptors/logging/request-response-logging-interceptor.module';
import { PaginationInterceptorModule } from '@libs/interceptors/pagination/pagination-interceptor.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PaginationInterceptorModule,
    ContextInterceptorModule,
    RequestResponseLoggingInterceptorModule,
  ],
})
export class InterceptorsModule {}
