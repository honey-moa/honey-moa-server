import { Test, TestingModule } from '@nestjs/testing';
import { OffsetPaginationQueryDto } from '@src/libs/api/dtos/offset-pagination-query.dto';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { PaginationResponseBuilder } from '@src/libs/interceptors/pagination/builders/pagination-interceptor-response.builder';
import { OffsetPaginationResponseDto } from '@src/libs/interceptors/pagination/dtos/pagination-interceptor-response.dto';

describe(PaginationResponseBuilder.name, () => {
  let builder: PaginationResponseBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationResponseBuilder],
    }).compile();

    builder = module.get<PaginationResponseBuilder>(PaginationResponseBuilder);
  });

  describe(
    PaginationResponseBuilder.prototype.offsetPaginationResponseBuild.name,
    () => {
      let res: { data: any };
      let pageDto: OffsetPaginationQueryDto;

      beforeEach(() => {
        res = {} as any;
        pageDto = new OffsetPaginationQueryDto();
      });

      it('data is not array type', () => {
        res.data = 'data';

        expect(() =>
          builder.offsetPaginationResponseBuild(res, pageDto),
        ).toThrow(HttpInternalServerErrorException);
      });

      it('array object is not array type', () => {
        res.data = ['arrayObject'];

        expect(() =>
          builder.offsetPaginationResponseBuild(res, pageDto),
        ).toThrow(HttpInternalServerErrorException);
      });

      it('totalCount is not number type', () => {
        res.data = [[], 'totalCount'];

        expect(() =>
          builder.offsetPaginationResponseBuild(res, pageDto),
        ).toThrow(HttpInternalServerErrorException);
      });

      it('totalCount is not integer format', () => {
        res.data = [[], 1.1];

        expect(() =>
          builder.offsetPaginationResponseBuild(res, pageDto),
        ).toThrow(HttpInternalServerErrorException);
      });

      it('pagination response object build', () => {
        res.data = [[], 1];

        pageDto.page = 1;
        pageDto.PageLimit = 20;

        expect(
          builder.offsetPaginationResponseBuild(res, pageDto),
        ).toBeInstanceOf(OffsetPaginationResponseDto);
      });
    },
  );
});
