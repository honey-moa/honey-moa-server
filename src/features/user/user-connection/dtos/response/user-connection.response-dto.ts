import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { HydratedBlogResponseDto } from '@features/blog/dtos/response/hydrated-blog.response-dto';
import { HydratedChatRoomResponseDto } from '@features/chat-room/dtos/response/hydrated-chat-room.response-dto';

export interface CreateUserConnectionResponseDtoProps
  extends CreateBaseResponseDtoProps {
  requesterId: AggregateID;
  requester?: HydratedUserResponseDto;
  requestedId: AggregateID;
  requested?: HydratedUserResponseDto;
  status: UserConnectionStatusUnion;

  blog?: HydratedBlogResponseDto;
  chatRoom?: HydratedChatRoomResponseDto;
}

export class UserConnectionResponseDto
  extends BaseResponseDto
  implements
    Omit<
      CreateUserConnectionResponseDtoProps,
      keyof CreateBaseResponseDtoProps | 'requesterId' | 'requestedId'
    >
{
  @ApiPropertyOptional({
    description: '요청자 정보',
    type: HydratedUserResponseDto,
  })
  requester?: HydratedUserResponseDto;

  @ApiProperty({
    description: '요청자 아이디',
    format: 'int64',
  })
  requesterId: string;

  @ApiPropertyOptional({
    description: '요청 수신자 정보',
    type: HydratedUserResponseDto,
  })
  requested?: HydratedUserResponseDto;

  @ApiProperty({
    description: '요청 수신자 아이디',
    format: 'int64',
  })
  requestedId: string;

  @ApiProperty({
    description: '요청 상태',
    enum: UserConnectionStatus,
  })
  status: UserConnectionStatusUnion;

  @ApiPropertyOptional({
    description:
      '블로그 정보. 해당 프로퍼티가 falsy한 값일 경우 블로그가 존재하지 않음.',
    type: HydratedBlogResponseDto,
  })
  blog?: HydratedBlogResponseDto;

  @ApiPropertyOptional({
    description:
      '채팅방 정보. 해당 프로퍼티가 falsy한 값일 경우 채팅방이 존재하지 않음.',
    type: HydratedChatRoomResponseDto,
  })
  chatRoom?: HydratedChatRoomResponseDto;

  constructor(props: CreateUserConnectionResponseDtoProps) {
    super(props);

    const {
      requester,
      requesterId,
      requested,
      requestedId,
      status,
      blog,
      chatRoom,
    } = props;

    this.requester = requester;
    this.requesterId = requesterId.toString();
    this.requested = requested;
    this.requestedId = requestedId.toString();
    this.status = status;
    this.blog = blog;
    this.chatRoom = chatRoom;
  }
}
