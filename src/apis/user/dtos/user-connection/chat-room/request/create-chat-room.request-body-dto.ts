import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CreateChatRoomRequestBodyDto {
  @ApiProperty({
    description: '채팅방 이름',
    minLength: 1,
    maxLength: 30,
  })
  @Length(1, 30)
  readonly name: string;
}
