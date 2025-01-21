import { IsBigIntString } from '@libs/api/decorators/is-big-int.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class EnterChatDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: '668734709767935500',
  })
  @IsBigIntString()
  roomId: bigint;
}
