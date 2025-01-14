import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CreateBlogRequestBodyDto {
  @ApiProperty({
    description: '블로그 이름',
    minLength: 1,
    maxLength: 30,
  })
  @Length(1, 30)
  name: string;
}
