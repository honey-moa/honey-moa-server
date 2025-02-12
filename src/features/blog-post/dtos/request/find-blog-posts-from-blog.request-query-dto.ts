import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { BlogPostModel } from '@features/blog-post/mappers/blog-post.mapper';
import { CursorPaginationRequestQueryDto } from '@libs/api/dtos/request/cursor-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { transformStringToBoolean } from '@libs/api/transformers/transform-string-to-boolean.transformer';
import { SortOrder } from '@libs/api/types/api.constant';
import { CursorBy, OrderBy } from '@libs/api/types/api.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';

type BlogPostModelForPaginated = Pick<
  BlogPostModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindBlogPostsFromBlogRequestQueryDto extends CursorPaginationRequestQueryDto<BlogPostModelForPaginated> {
  @ApiPropertyOptional({
    description: '필터링 할 게시글 제목',
    minLength: BlogPostEntity.BLOG_POST_TITLE_LENGTH.MIN,
    maxLength: BlogPostEntity.BLOG_POST_TITLE_LENGTH.MAX,
  })
  @IsOptional()
  @Length(
    BlogPostEntity.BLOG_POST_TITLE_LENGTH.MIN,
    BlogPostEntity.BLOG_POST_TITLE_LENGTH.MAX,
  )
  title?: string;

  @ApiPropertyOptional({
    description:
      '필터링 할 게시글 날짜.<br>' +
      '시간 제외 날짜 값까지만 허용. ex)2025-02-06<br>' +
      '만약 2025만 입력한다면 2025년 1월 1일 0시 0분 0초 ~ 2025년 12월 31일 23시 59분 59초 사이의 게시글을 조회함.<br>' +
      '2025-02 까지만 입력 시 2025년 2월 1일 0시 0분 0초 ~ 2025년 2월 28일 23시 59분 59초 사이의 게시글을 조회함.<br>' +
      '2025-02-06 입력 시 2025년 2월 6일 0시 0분 0초 ~ 2025년 2월 6일 23시 59분 59초 사이의 게시글을 조회함.',
    format: 'date',
    maxLength: 10,
  })
  @IsOptional()
  @IsDateString()
  @MaxLength(10)
  datePeriod?: string;

  @ApiPropertyOptional({
    description:
      '비공개 게시글 조회 여부.<br>' +
      '커넥션에 속하지 않은 유저가 true 값을 줄 시 에러처리',
    default: false,
  })
  @IsBoolean()
  @Transform(transformStringToBoolean)
  showPrivatePosts: boolean = false;

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
