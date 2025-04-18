import { IsPositiveBigInt } from '@libs/api/decorators/is-positive-bigint.decorator';
import type { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty } from '@nestjs/swagger';

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
