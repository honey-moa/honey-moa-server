import { ContextInterceptor } from '@libs/interceptors/context/context.interceptor';
import { Module } from '@nestjs/common';

@Module({
  providers: [ContextInterceptor],
})
export class ContextInterceptorModule {}
