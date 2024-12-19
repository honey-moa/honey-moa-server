import { Module } from '@nestjs/common';
import { HttpClientErrorExceptionFilter } from '@src/libs/exceptions/client-errors/filters/http-client-error.exception-filter';
import { HttpPathNotFoundExceptionFilter } from '@src/libs/exceptions/etc-errors/filters/http-path-not-found-exception.filter';
import { HttpInternalServerErrorExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-internal-server-error-exception.filter';
import { HttpProcessErrorExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-process-error-exception.filter';
import { HttpRemainderExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-remainder-exception.filter';
import { HttpExceptionService } from '@src/libs/exceptions/services/http-exception.service';

@Module({
  providers: [
    HttpProcessErrorExceptionFilter,
    HttpRemainderExceptionFilter,
    HttpInternalServerErrorExceptionFilter,
    HttpClientErrorExceptionFilter,
    HttpPathNotFoundExceptionFilter,
    HttpExceptionService,
  ],
})
export class ExceptionsModule {}
