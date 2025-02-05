import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';

export interface CreateBlogResponseDtoProps extends CreateBaseResponseDtoProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
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
    format: 'int64',
    description: '블로그 생성 유저 ID',
  })
  readonly createdBy: AggregateID;

  @ApiProperty({
    format: 'int64',
    description: '유저 커넥션 ID',
  })
  readonly connectionId: AggregateID;

  @ApiPropertyOptional({
    description: '블로그에 속해 있는 유저들 정보',
    type: [HydratedUserResponseDto],
  })
  readonly members?: HydratedUserResponseDto[];

  constructor(create: CreateBlogResponseDtoProps) {
    super(create);

    const { name, createdBy, connectionId, members } = create;

    this.name = name;
    this.createdBy = createdBy;
    this.connectionId = connectionId;
    this.members = members;
  }
}
