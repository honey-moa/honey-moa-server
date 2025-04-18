import { IsBigIntString } from '@libs/api/decorators/is-big-int.decorator';
import { IsNullable } from '@libs/api/decorators/is-nullable.decorator';
import type { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, Length } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: '668734709767935500',
  })
  @IsBigIntString()
  roomId: AggregateID;

  @ApiProperty({
    description: '메시지',
    example: '안녕하세요',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @Length(1, 1000)
  message: string;

  @ApiPropertyOptional({
    description: '블로그 게시글 URL',
    example: 'https://honeymoa.com/blog/2',
    default: null,
    minLength: 1,
    maxLength: 255,
  })
  @IsNullable()
  @IsUrl()
  @Length(1, 255)
  blogPostUrl: string | null = null;
}
