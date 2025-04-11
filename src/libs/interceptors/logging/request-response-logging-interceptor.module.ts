import { RequestResponseLoggingInterceptor } from '@libs/interceptors/logging/request-response-logging.interceptor';
import { Module } from '@nestjs/common';

@Module({
  providers: [RequestResponseLoggingInterceptor],
})
export class RequestResponseLoggingInterceptorModule {}
