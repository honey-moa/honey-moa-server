import { IsPositiveBigInt } from '@libs/api/decorators/is-positive-bigint.decorator';
import type { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty } from '@nestjs/swagger';

export class EnterChatDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: '668734709767935500',
  })
  @IsPositiveBigInt()
  roomId: AggregateID;
}
