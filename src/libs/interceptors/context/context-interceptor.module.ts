import { Module } from '@nestjs/common';
import { ContextInterceptor } from '@libs/interceptors/context/context.interceptor';

@Module({
  providers: [ContextInterceptor],
})
export class ContextInterceptorModule {}
