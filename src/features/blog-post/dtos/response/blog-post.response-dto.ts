import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { HydratedTagResponseDto } from '@features/tag/dtos/response/hydrated-tag.response-dto';
import { BlogPostContents } from '@features/blog-post/types/blog-post.type';
import { HydratedBlogResponseDto } from '@features/blog/dtos/response/hydrated-blog.response-dto';

export interface CreateBlogPostResponseDtoProps
  extends CreateBaseResponseDtoProps {
  blogId: AggregateID;
  userId: AggregateID;
  title: string;
  contents: BlogPostContents;
  date: string;
  location: string;
  isPublic: boolean;

  tags?: HydratedTagResponseDto[];
  blog?: HydratedBlogResponseDto;
}

export class BlogPostResponseDto
  extends BaseResponseDto
  implements
    Omit<CreateBlogPostResponseDtoProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    format: 'int64',
    description: '블로그 생성 유저 ID',
    type: 'string',
  })
  readonly userId: AggregateID;

  @ApiProperty({
    format: 'int64',
    description: '블로그 ID',
    type: 'string',
  })
  readonly blogId: AggregateID;

  @ApiProperty({
    example: '블로그입니다',
    description: '블로그 이름',
    minLength: 1,
    maxLength: 255,
  })
  readonly title: string;

  @ApiProperty({
    description: '게시글 본문',
    isArray: true,
    items: {
      type: 'object',
    },
  })
  readonly contents: BlogPostContents;

  @ApiProperty({
    example: '2025-01-01',
    description: '게시글 내용의 일자',
    minLength: 1,
    maxLength: 20,
  })
  readonly date: string;

  @ApiProperty({
    example: '서울',
    description: '게시글 내용의 위치',
    minLength: 1,
    maxLength: 100,
  })
  readonly location: string;

  @ApiProperty({
    description: '게시글 공개 여부',
  })
  readonly isPublic: boolean;

  @ApiPropertyOptional({
    description: '게시글 태그',
    isArray: true,
    type: HydratedTagResponseDto,
  })
  readonly tags?: HydratedTagResponseDto[];

  @ApiPropertyOptional({
    description: '블로그 정보',
    type: HydratedBlogResponseDto,
  })
  readonly blog?: HydratedBlogResponseDto;

  constructor(create: CreateBlogPostResponseDtoProps) {
    super(create);

    const {
      userId,
      blogId,
      title,
      contents,
      date,
      location,
      tags,
      isPublic,
      blog,
    } = create;

    this.userId = userId;
    this.blogId = blogId;
    this.title = title;
    this.contents = contents;
    this.date = date;
    this.location = location;
    this.tags = tags;
    this.isPublic = isPublic;
    this.blog = blog;
  }
}
