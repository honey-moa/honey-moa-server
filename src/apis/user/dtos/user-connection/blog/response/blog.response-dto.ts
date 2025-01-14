import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@src/libs/api/dtos/response/base.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface CreateBlogResponseDtoProps extends CreateBaseResponseDtoProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
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

  constructor(create: CreateBlogResponseDtoProps) {
    super(create);

    const { name, createdBy, connectionId } = create;

    this.name = name;
    this.createdBy = createdBy;
    this.connectionId = connectionId;
  }
}
