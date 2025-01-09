import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedUserResponseDto } from '@src/apis/user/dtos/response/hydrated-user.response-dto';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@src/libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

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

  constructor(props: CreateUserConnectionResponseDtoProps) {
    super(props);

    const { requester, requesterId, requested, requestedId, status } = props;

    this.requester = requester;
    this.requesterId = requesterId.toString();
    this.requested = requested;
    this.requestedId = requestedId.toString();
    this.status = status;
  }
}
