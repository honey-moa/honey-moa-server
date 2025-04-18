import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface CreateBlogPostCommentResponseDtoProps
  extends CreateBaseResponseDtoProps {
  blogPostId: AggregateID;
  userId: AggregateID;
  content: string;

  user?: HydratedUserResponseDto;
}

export class BlogPostCommentResponseDto
  extends BaseResponseDto
  implements
    Omit<
      CreateBlogPostCommentResponseDtoProps,
      keyof CreateBaseResponseDtoProps
    >
{
  @ApiProperty({
    description: '블로그 포스트 id',
    type: 'string',
    format: 'int64',
  })
  readonly blogPostId: AggregateID;

  @ApiProperty({
    description: '댓글 작성자 id',
    type: 'string',
    format: 'int64',
  })
  readonly userId: AggregateID;

  @ApiProperty({
    example: '블로그 포스트 댓글 내용',
    description: '블로그 포스트 댓글 내용',
    minLength: 1,
    maxLength: 255,
  })
  readonly content: string;

  @ApiPropertyOptional({
    type: HydratedUserResponseDto,
  })
  readonly user?: HydratedUserResponseDto;

  constructor(create: CreateBlogPostCommentResponseDtoProps) {
    super(create);

    const { blogPostId, userId, content, user } = create;

    this.blogPostId = blogPostId;
    this.userId = userId;
    this.content = content;
    this.user = user;
  }
}
