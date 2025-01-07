import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveBigInt } from '@src/libs/api/decorators/is-positive-bigint.decorator';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class CreateUserConnectionRequestBodyDto {
  @ApiProperty({
    description: '연결을 요청하려는 유저 ID',
    type: String,
    format: 'int64',
    minimum: 1,
  })
  @IsPositiveBigInt()
  requestedId: AggregateID;
}
