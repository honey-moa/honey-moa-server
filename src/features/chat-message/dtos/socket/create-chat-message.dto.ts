import { IsBigIntString } from '@libs/api/decorators/is-big-int.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: '668734709767935500',
  })
  @IsBigIntString()
  roomId: bigint;

  @ApiProperty({
    description: '메시지',
    example: '안녕하세요',
  })
  @IsString()
  message: string;
}
