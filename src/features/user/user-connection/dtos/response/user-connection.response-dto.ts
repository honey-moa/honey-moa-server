import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import type { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import type { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface CreateUserConnectionResponseDtoProps
  extends CreateBaseResponseDtoProps {
  requesterId: AggregateID;
  requester?: HydratedUserResponseDto;
  requestedId: AggregateID;
  requested?: HydratedUserResponseDto;
  status: UserConnectionStatusUnion;
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
    type: 'string',
  })
  requesterId: AggregateID;

  @ApiPropertyOptional({
    description: '요청 수신자 정보',
    type: HydratedUserResponseDto,
  })
  requested?: HydratedUserResponseDto;

  @ApiProperty({
    description: '요청 수신자 아이디',
    format: 'int64',
    type: 'string',
  })
  requestedId: AggregateID;

  @ApiProperty({
    description: '요청 상태',
    enum: UserConnectionStatus,
  })
  status: UserConnectionStatusUnion;

  constructor(props: CreateUserConnectionResponseDtoProps) {
    super(props);

    const { requester, requesterId, requested, requestedId, status } = props;

    this.requester = requester;
    this.requesterId = requesterId;
    this.requested = requested;
    this.requestedId = requestedId;
    this.status = status;
  }
}
