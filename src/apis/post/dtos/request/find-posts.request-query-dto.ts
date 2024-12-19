import { ApiPropertyOptional } from '@nestjs/swagger';
import { OffsetPaginationRequestQueryDto } from '@src/libs/api/dtos/request/offset-pagination.request-query-dto';

import { IsOptional, Length } from 'class-validator';

export class FindPostsRequestQueryDto extends OffsetPaginationRequestQueryDto {
  @ApiPropertyOptional({
    description: '게시글 제목 필터링',
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @Length(1, 20)
  title?: string;

  @ApiPropertyOptional({
    description: '게시글 본문 필터링',
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @Length(1, 20)
  body?: string;
}
