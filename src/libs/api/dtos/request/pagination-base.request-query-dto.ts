import { transformPage } from '@libs/api/transformers/page.transformer';
import { PageLimit, SortOrder } from '@libs/api/types/api.constant';
import { OrderBy, SortOrderUnion } from '@libs/api/types/api.type';
import { BaseModel } from '@libs/db/base.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class OrderByDto {
  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  id: SortOrderUnion = SortOrder.DESC;
}

/**
 * pagination 을 구현하는 request query dto 에 상속받아 사용합니다.
 */
export abstract class PaginationBaseRequestQueryDto<
  Model extends Pick<BaseModel, 'id'>,
> {
  @ApiPropertyOptional({
    description:
      '페이지번호. 보내지 않으면 기본적으로 cursor pagination 으로 동작합니다.<br>' +
      '페이지를 보내고 cursor를 보내지 않는 경우에만 offset pagination 으로 동작합니다.' +
      'cursor 필드가 존재하지 않는 경우 offset pagination만 지원.',
    type: 'number',
    format: 'integer',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Min(0)
  @IsInt()
  @Transform(transformPage)
  page?: number;

  @ApiPropertyOptional({
    description: '페이지당 아이템 수',
    type: 'number',
    format: 'integer',
    minimum: 1,
    maximum: PageLimit.MAXIMUM,
    default: PageLimit.DEFAULT,
  })
  @IsOptional()
  @Max(PageLimit.MAXIMUM)
  @Min(1)
  @IsInt()
  @Type(() => Number)
  limit = PageLimit.DEFAULT;

  abstract orderBy?: OrderBy<Model>;
}
