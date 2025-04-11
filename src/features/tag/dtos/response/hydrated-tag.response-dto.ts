import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { ApiProperty } from '@nestjs/swagger';

export interface CreateHydratedTagProps extends CreateBaseResponseDtoProps {
  name: string;
}

export class HydratedTagResponseDto
  extends BaseResponseDto
  implements Omit<CreateHydratedTagProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: 'JS',
    description: '태그 이름',
    minLength: 1,
    maxLength: 20,
  })
  readonly name: string;

  constructor(props: CreateHydratedTagProps) {
    super(props);

    this.name = props.name;
  }
}
