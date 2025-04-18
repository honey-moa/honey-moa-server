import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';

export interface CreateHydratedChatRoomProps
  extends CreateBaseResponseDtoProps {}

export class HydratedChatRoomResponseDto
  extends BaseResponseDto
  implements Omit<CreateHydratedChatRoomProps, keyof CreateBaseResponseDtoProps>
{
  constructor(props: CreateHydratedChatRoomProps) {
    super(props);
  }
}
