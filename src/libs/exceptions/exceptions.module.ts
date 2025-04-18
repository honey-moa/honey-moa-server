import { BadRequestExceptionFilter } from '@libs/exceptions/client-errors/filters/bad-request.exception-filter';
import { HttpClientErrorExceptionFilter } from '@libs/exceptions/client-errors/filters/http-client-error.exception-filter';
import { HttpPathNotFoundExceptionFilter } from '@libs/exceptions/etc-errors/filters/http-path-not-found.exception-filter';
import { HttpInternalServerErrorExceptionFilter } from '@libs/exceptions/server-errors/filters/http-internal-server-error.exception-filter';
import { HttpProcessErrorExceptionFilter } from '@libs/exceptions/server-errors/filters/http-process-error.exception-filter';
import { HttpRemainderExceptionFilter } from '@libs/exceptions/server-errors/filters/http-remainder.exception-filter';
import { ZodErrorExceptionFilter } from '@libs/exceptions/server-errors/filters/zod-error.exception-filter';
import { HttpExceptionService } from '@libs/exceptions/services/http-exception.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    HttpProcessErrorExceptionFilter,
    HttpRemainderExceptionFilter,
    HttpInternalServerErrorExceptionFilter,
    HttpClientErrorExceptionFilter,
    HttpPathNotFoundExceptionFilter,
    ZodErrorExceptionFilter,
    HttpExceptionService,
    BadRequestExceptionFilter,
  ],
})
export class ExceptionsModule {}
