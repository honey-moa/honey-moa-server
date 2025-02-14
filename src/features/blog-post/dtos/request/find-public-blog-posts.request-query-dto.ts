import { CursorPaginationRequestQueryDto } from '@libs/api/dtos/request/cursor-pagination.request-query-dto';
import { BlogPostModel } from '@features/blog-post/mappers/blog-post.mapper';
import { IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorBy, OrderBy } from '@libs/api/types/api.type';
import { ParseQueryByColonAndTransformToObject } from '@libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { SortOrder } from '@libs/api/types/api.constant';

type BlogPostModelForPaginated = Pick<
  BlogPostModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindPublicBlogPostsRequestQueryDto extends CursorPaginationRequestQueryDto<BlogPostModelForPaginated> {
  @ApiPropertyOptional({
    description: '게시글 제목',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @ParseQueryByColonAndTransformToObject({
    id: {
      enum: SortOrder,
    },
    createdAt: {
      enum: SortOrder,
    },
    updatedAt: {
      enum: SortOrder,
    },
  })
  orderBy?: OrderBy<BlogPostModelForPaginated>;

  @ParseQueryByColonAndTransformToObject({
    id: {
      type: 'bigint',
      required: true,
    },
    createdAt: {
      type: 'date',
    },
    updatedAt: {
      type: 'date',
    },
  })
  cursor?: CursorBy<BlogPostModelForPaginated, 'id'>;
}
