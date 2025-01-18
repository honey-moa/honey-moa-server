import { Module } from '@nestjs/common';
import { RequestResponseLoggingInterceptor } from '@libs/interceptors/logging/request-response-logging.interceptor';

@Module({
  providers: [RequestResponseLoggingInterceptor],
})
export class RequestResponseLoggingInterceptorModule {}
