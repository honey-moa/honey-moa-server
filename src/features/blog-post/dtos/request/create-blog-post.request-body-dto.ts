import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsDateString,
  Length,
} from 'class-validator';

export class CreateBlogPostRequestBodyDto {
  @ApiProperty({
    description: '게시글 제목',
    minLength: 1,
    maxLength: 255,
  })
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    type: 'object',
    isArray: true,
    additionalProperties: true,
  })
  @ArrayNotEmpty()
  contents: Array<Record<string, any>>;

  @ApiProperty({
    description: '해당 게시글 내용의 날짜',
    minLength: 1,
    maxLength: 20,
    format: 'date',
  })
  @Length(1, 20)
  @IsDateString()
  date: string;

  @ApiProperty({
    description: '해당 게시글 내용의 위치',
    minLength: 1,
    maxLength: 100,
  })
  @Length(1, 100)
  location: string;

  @ApiPropertyOptional({
    description: '해당 게시글 내용의 태그 이름',
    isArray: true,
    default: [],
    uniqueItems: true,
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 20,
    },
  })
  @Length(1, 20, { each: true })
  @ArrayUnique()
  tagNames: string[] = [];
}
