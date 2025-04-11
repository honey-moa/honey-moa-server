import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import type { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface CreateBlogResponseDtoProps extends CreateBaseResponseDtoProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  description: string;
  dDayStartDate: string;
  backgroundImageUrl: string | null;
  memberIds: AggregateID[];

  members?: HydratedUserResponseDto[];
}

export class BlogResponseDto
  extends BaseResponseDto
  implements Omit<CreateBlogResponseDtoProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '블로그입니다',
    description: '블로그 이름',
    minLength: 1,
    maxLength: 30,
  })
  readonly name: string;

  @ApiProperty({
    description: '블로그 설명',
    minLength: 1,
    maxLength: 255,
  })
  readonly description: string;

  @ApiProperty({
    description: 'D-day 시작일 (날짜까지만)',
    format: 'date',
  })
  readonly dDayStartDate: string;

  @ApiProperty({
    description: '블로그 배경 이미지 url',
    type: 'string',
    format: 'uri',
    nullable: true,
  })
  readonly backgroundImageUrl: string | null;

  @ApiProperty({
    format: 'int64',
    description: '블로그 생성 유저 ID',
    type: 'string',
  })
  readonly createdBy: AggregateID;

  @ApiProperty({
    format: 'int64',
    description: '유저 커넥션 ID',
    type: 'string',
  })
  readonly connectionId: AggregateID;

  @ApiProperty({
    format: 'int64',
    description: '블로그에 속해 있는 유저 IDs',
    type: 'string',
    isArray: true,
  })
  readonly memberIds: AggregateID[];

  @ApiPropertyOptional({
    description: '블로그에 속해 있는 유저들 정보',
    type: [HydratedUserResponseDto],
  })
  readonly members?: HydratedUserResponseDto[];

  constructor(create: CreateBlogResponseDtoProps) {
    super(create);

    const {
      name,
      createdBy,
      connectionId,
      memberIds,
      members,
      description,
      dDayStartDate,
      backgroundImageUrl,
    } = create;

    this.name = name;
    this.description = description;
    this.dDayStartDate = dDayStartDate;
    this.backgroundImageUrl = backgroundImageUrl;
    this.createdBy = createdBy;
    this.connectionId = connectionId;
    this.memberIds = memberIds;
    this.members = members;
  }
}
