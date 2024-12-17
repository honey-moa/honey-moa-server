import { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty } from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty({
    example: '554965628120837912',
    description: '고유 ID',
  })
  readonly id: string;

  constructor(id: AggregateID) {
    this.id = id.toString();
  }
}
