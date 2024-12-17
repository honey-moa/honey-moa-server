import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OffsetPaginationRequestQueryDto } from '@src/libs/api/dtos/request/offset-pagination.request-query-dto';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { PaginationResponseBuilder } from '@src/libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { SET_PAGINATION } from '@src/libs/interceptors/pagination/types/pagination-interceptor.constant';

import { PaginationBy } from '@src/libs/interceptors/pagination/types/pagination-interceptor.enum';
import { PaginationInterceptorArgs } from '@src/libs/interceptors/pagination/types/pagination-interceptor.type';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly paginationResponseBuilder: PaginationResponseBuilder,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        const paginationBy = this.reflector.get<
          PaginationInterceptorArgs | undefined
        >(SET_PAGINATION, context.getHandler());

        // paginationBy 가 없으면 해당 인터셉터를 사용하지 않는다고 판별한다.
        if (!paginationBy) return data;

        // Offset-base pagination response
        if (paginationBy === PaginationBy.Offset) {
          const request = context.switchToHttp().getRequest();
          const { query } = request;
          const { page, limit }: OffsetPaginationRequestQueryDto = query;

          return this.paginationResponseBuilder.offsetPaginationResponseBuild(
            { data },
            { page, limit },
          );
        }

        // Cursor-base pagination response
        if (paginationBy === PaginationBy.Cursor) {
          throw new HttpInternalServerErrorException({
            ctx: 'Not implemented',
            code: COMMON_ERROR_CODE.SERVER_ERROR,
          });
        }

        return data;
      }),
    );
  }
}
