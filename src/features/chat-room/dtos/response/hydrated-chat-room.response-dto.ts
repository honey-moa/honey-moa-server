import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';

export interface CreateHydratedChatRoomProps
  extends CreateBaseResponseDtoProps {
  name: string;
}

export class HydratedChatRoomResponseDto
  extends BaseResponseDto
  implements
    Omit<CreateHydratedChatRoomProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '너와 나의 채팅방',
    description: '채팅방 이름',
    minLength: 1,
    maxLength: 20,
  })
  readonly name: string;

  constructor(props: CreateHydratedChatRoomProps) {
    super(props);

    this.name = props.name;
  }
}
