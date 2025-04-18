import { CursorBy } from '@libs/api/types/api.type';
import { BaseModel } from '@libs/db/base.schema';
import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptions,
  ApiResponse,
} from '@nestjs/swagger';

export class CursorPaginationResponseDto {
  @ApiProperty({
    description: '데이터의 총 개수',
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

  static swaggerBuilder(
    status: Exclude<HttpStatus, ErrorHttpStatusCode>,
    key: string,
    type: Type,
    cursorTypes: { format?: string; key: string }[],
  ): ReturnType<typeof applyDecorators>;

  static swaggerBuilder(
    status: Exclude<HttpStatus, ErrorHttpStatusCode>,
    key: string,
    type: Type,
    cursorTypes: { format?: string; key: string }[],
    getOnlyType?: false,
    options?: ApiPropertyOptions,
  ): ReturnType<typeof applyDecorators>;

  static swaggerBuilder(
    status: Exclude<HttpStatus, ErrorHttpStatusCode>,
    key: string,
    type: Type,
    cursorTypes: { format?: string; key: string }[],
    getOnlyType: true,
    options?: ApiPropertyOptions, // eslint-disable-next-line @typescript-eslint/ban-types
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
  ): Function;

  static swaggerBuilder(
    status: Exclude<HttpStatus, ErrorHttpStatusCode>,
    key: string,
    type: Type,
    cursorTypes: { format?: string; key: string }[],
    getOnlyType: boolean = false,
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

      @ApiProperty({
        type: 'object',
        description: '다음 커서 정보. 마지막 페이지라면 null을 반환',
        properties: cursorTypes.reduce((acc, cursorType) => {
          acc[cursorType.key] = {
            format: cursorType.format || 'string',
            type: 'string',
            description: `${cursorType.key}에 대한 커서`,
          };
          return acc;
        }, {}),
        nullable: true,
      })
      private readonly nextCursor: string;
    }

    Object.defineProperty(Temp, 'name', {
      value: `${key[0].toUpperCase()}${key.slice(1)}${this.name}`,
    });

    if (getOnlyType) {
      return Temp;
    }

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
      nextCursor: null | CursorBy<BaseModel, 'id' | 'createdAt' | 'updatedAt'>;
    },
  ) {
    Object.assign(this, Object.assign(res, pageInfo));
  }
}
