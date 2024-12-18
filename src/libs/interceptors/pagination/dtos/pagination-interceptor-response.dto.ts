import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptions,
  ApiResponse,
} from '@nestjs/swagger';

export class OffsetPaginationResponseDto {
  @ApiProperty({
    description: '총 페이지 수',
    minimum: 1,
    format: 'integer',
  })
  totalCount: number;

  @ApiProperty({
    description: '한 요청에 대한 data 수',
    minimum: 1,
    format: 'integer',
  })
  limit: number;

  @ApiProperty({
    description: '현재 페이지 번호',
    minimum: 1,
    format: 'integer',
  })
  currentPage: number;

  @ApiProperty({
    type: Number,
    description: '다음 페이지 번호, 다음 페이지가 없다면 null 반환',
    minimum: 2,
    format: 'integer',
    nullable: true,
  })
  nextPage: number | null;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    minimum: 1,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '마지막 페이지 번호',
    minimum: 1,
    format: 'integer',
  })
  lastPage: number;

  static swaggerBuilder(
    status: Exclude<HttpStatus, ErrorHttpStatusCode>,
    key: string,
    type: Type,
    options: ApiPropertyOptions = {},
  ) {
    class Temp extends this {
      @ApiProperty({
        type,
        name: 'contents',
        isArray: true,
        ...options,
      })
      private readonly temp: string;
    }

    Object.defineProperty(Temp, 'name', {
      value: `${key[0].toUpperCase()}${key.slice(1)}${this.name}`,
    });

    return applyDecorators(
      ApiExtraModels(type),
      ApiResponse({ status, type: Temp }),
    );
  }

  constructor(
    res: { [key: string]: unknown[] },
    pageInfo: {
      totalCount: number;
      limit: number;
      currentPage: number;
      nextPage: number | null;
      hasNext: boolean;
      lastPage: number;
    },
  ) {
    Object.assign(this, Object.assign(res, pageInfo));
  }
}
