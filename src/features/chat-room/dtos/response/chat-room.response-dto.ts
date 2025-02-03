import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';

export interface CreateChatRoomResponseDtoProps
  extends CreateBaseResponseDtoProps {
  readonly createdBy: AggregateID;
  readonly connectionId: AggregateID;
}

export class ChatRoomResponseDto
  extends BaseResponseDto
  implements
    Omit<CreateChatRoomResponseDtoProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    format: 'int64',
    description: '채팅방 생성 유저 ID',
  })
  readonly createdBy: AggregateID;

  @ApiProperty({
    format: 'int64',
    description: '유저 커넥션 ID',
  })
  readonly connectionId: AggregateID;

  constructor(create: CreateChatRoomResponseDtoProps) {
    super(create);

    const { createdBy, connectionId } = create;

    this.createdBy = createdBy;
    this.connectionId = connectionId;
  }
}
