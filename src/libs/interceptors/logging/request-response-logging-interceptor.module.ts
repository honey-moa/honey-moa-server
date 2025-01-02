import { Module } from '@nestjs/common';
import { RequestResponseLoggingInterceptor } from '@src/libs/interceptors/logging/request-response-logging.interceptor';

@Module({
  providers: [RequestResponseLoggingInterceptor],
})
export class RequestResponseLoggingInterceptorModule {}
