import { Injectable } from '@nestjs/common';
import { OffsetPaginationRequestQueryDto } from '@src/libs/api/dtos/request/offset-pagination.request-query-dto';
import { PageLimit } from '@src/libs/api/types/api.constant';
import { CursorBy } from '@src/libs/api/types/api.type';
import { BaseModel } from '@src/libs/db/base.schema';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { ERROR_CODE } from '@src/libs/exceptions/types/errors/error-code.constant';
import { CursorPaginationResponseDto } from '@src/libs/interceptors/pagination/dtos/cursor-pagination-interceptor.response-dto';
import { OffsetPaginationResponseDto } from '@src/libs/interceptors/pagination/dtos/offset-pagination-interceptor.response-dto';

interface Res {
  data: unknown;
}

@Injectable()
export class PaginationResponseBuilder {
  /**
   * Offset-Based Pagination response builder
   * @description array type 만 허용
   */
  offsetPaginationResponseBuild(
    res: Res,
    pageDto: OffsetPaginationRequestQueryDto<BaseModel>,
  ) {
    const { data } = res;

    if (!Array.isArray(data)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 data 가 array type 이 아님',
      });
    }

    const [array, totalCount] = data;

    if (!Array.isArray(array)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 조회된 객체가 array type 이 아님',
      });
    }

    if (typeof totalCount !== 'number') {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 totalCount 가 number type 이 아님',
      });
    }

    if (!Number.isInteger(totalCount)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 totalCount 가 integer format 이 아님',
      });
    }

    const currentPage = Number(pageDto.page) || 1;
    const limit = Number(pageDto.limit) || PageLimit.DEFAULT;
    const nextPage = limit * currentPage < totalCount ? currentPage + 1 : null;
    const hasNext = limit * currentPage < totalCount;
    const lastPage = Math.ceil(totalCount / limit);

    return new OffsetPaginationResponseDto(
      { contents: array },
      {
        totalCount,
        currentPage,
        limit,
        nextPage,
        hasNext,
        lastPage,
      },
    );
  }

  /**
   * Offset-Based Pagination response builder
   * @description array type 만 허용
   */
  cursorPaginationResponseBuild(res: Res, cursorDto: { limit: number }) {
    const { data } = res;

    if (!Array.isArray(data)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 data 가 array type 이 아님',
      });
    }

    const [array, totalCount] = data;

    if (!Array.isArray(array)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 조회된 객체가 array type 이 아님',
      });
    }

    if (typeof totalCount !== 'number') {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 totalCount 가 number type 이 아님',
      });
    }

    if (!Number.isInteger(totalCount)) {
      throw new HttpInternalServerErrorException({
        code: ERROR_CODE.SERVER_ERROR,
        ctx: 'pagination response build 중 totalCount 가 integer format 이 아님',
      });
    }

    const limit = Number(cursorDto.limit) || PageLimit.DEFAULT;

    let nextCursor: null | CursorBy<
      BaseModel,
      'id' | 'createdAt' | 'updatedAt'
    >;

    if (array.length < limit) {
      nextCursor = null;
    } else {
      const lastItem = array[array.length - 1];

      nextCursor = {
        id: lastItem.id,
        createdAt: lastItem.createdAt,
        updatedAt: lastItem.updatedAt,
      };
    }

    return new CursorPaginationResponseDto(
      { contents: array },
      {
        totalCount,
        nextCursor,
        limit,
      },
    );
  }
}
