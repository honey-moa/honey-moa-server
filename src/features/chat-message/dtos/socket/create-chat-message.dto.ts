import { IsBigIntString } from '@libs/api/decorators/is-big-int.decorator';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

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
}
