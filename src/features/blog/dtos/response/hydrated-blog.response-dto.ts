import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';

export interface CreateHydratedBlogProps extends CreateBaseResponseDtoProps {
  name: string;
}

export class HydratedBlogResponseDto
  extends BaseResponseDto
  implements Omit<CreateHydratedBlogProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '너와 나의 이야기',
    description: '블로그 이름',
    minLength: 1,
    maxLength: 20,
  })
  readonly name: string;

  constructor(props: CreateHydratedBlogProps) {
    super(props);

    this.name = props.name;
  }
}
