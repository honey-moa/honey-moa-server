import { ApiProperty } from '@nestjs/swagger';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface CreateBaseResponseDtoProps {
  id: AggregateID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Most of our response objects will have properties like
 * id, createdAt and updatedAt so we can move them to a
 * separate class and extend it to avoid duplication.
 */
export class BaseResponseDto extends IdResponseDto {
  @ApiProperty({
    example: '2020-11-24T17:43:15.970Z',
    description: '생성 일자',
  })
  readonly createdAt: string;

  @ApiProperty({
    example: '2020-11-24T17:43:15.970Z',
    description: '수정 일자',
  })
  readonly updatedAt: string;

  constructor(props: CreateBaseResponseDtoProps) {
    super(props.id);
    this.createdAt = new Date(props.createdAt).toISOString();
    this.updatedAt = new Date(props.updatedAt).toISOString();
  }
}
