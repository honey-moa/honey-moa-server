import { ApiProperty } from '@nestjs/swagger';
import { Length, MinLength } from 'class-validator';

export class CreatePostRequestBodyDto {
  @ApiProperty({
    description: '게시글 제목',
    minLength: 1,
    maxLength: 255,
  })
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: '게시글 본문',
    minLength: 1,
  })
  @MinLength(1)
  body: string;
}
