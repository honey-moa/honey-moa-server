import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@src/libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface CreatePostResponseDtoProps extends CreateBaseResponseDtoProps {
  userId: AggregateID;

  title: string;
  body: string;

  user?: UserResponseDto;
}

export class PostResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: '554965628120837912',
    description: '작성자 ID',
    format: 'int64',
  })
  readonly userId: string;

  @ApiProperty({
    example: '반갑습니다',
    description: '게시글 제목',
    minLength: 1,
    maxLength: 255,
  })
  readonly title: string;

  @ApiProperty({
    example: '내공 냠냠',
    description: '게시글 본문',
    minLength: 1,
  })
  readonly body: string;

  @ApiPropertyOptional({
    description: '게시글 작성자 정보',
  })
  readonly user?: UserResponseDto;

  constructor(create: CreatePostResponseDtoProps) {
    super(create);

    const { userId, title, body, user } = create;

    this.userId = userId.toString();

    this.body = body;
    this.title = title;

    if (user) {
      this.user = user;
    }
  }
}
