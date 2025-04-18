import type { OffsetPaginationRequestQueryDto } from '@libs/api/dtos/request/offset-pagination.request-query-dto';
import type { BaseModel } from '@libs/db/base.schema';
import type { PaginationResponseBuilder } from '@libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { SET_PAGINATION } from '@libs/interceptors/pagination/types/pagination-interceptor.constant';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import type { PaginationInterceptorArgs } from '@libs/interceptors/pagination/types/pagination-interceptor.type';
import { isNil } from '@libs/utils/util';

import type { Observable } from 'rxjs';
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
        const usePagination = this.reflector.get<
          PaginationInterceptorArgs | undefined
        >(SET_PAGINATION, context.getHandler());

        // paginationBy 가 없으면 해당 인터셉터를 사용하지 않는다고 판별한다.
        if (!usePagination) return data;

        const { query } = context.switchToHttp().getRequest();

        /**
         * Offset-base pagination response
         * @description page가 존재하고, cursor가 없다면 Offset-base pagination 을 적용한다.
         */
        if (isNil(query.cursor) && query.page) {
          const { page, limit }: OffsetPaginationRequestQueryDto<BaseModel> =
            query;

          return this.paginationResponseBuilder.offsetPaginationResponseBuild(
            { data },
            { page, limit },
          );
        }

        /**
         * Cursor-base pagination response
         * @description page가 존재하고, cursor가 없는 상황 외의 모든 상황에서 Cursor-base pagination 을 적용한다.
         */

        const { limit }: OffsetPaginationRequestQueryDto<BaseModel> = query;

        return this.paginationResponseBuilder.cursorPaginationResponseBuild(
          { data },
          { limit },
        );

        return data;
      }),
    );
  }
}
