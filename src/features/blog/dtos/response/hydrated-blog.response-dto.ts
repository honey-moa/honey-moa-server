import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';

export interface CreateHydratedBlogProps extends CreateBaseResponseDtoProps {
  name: string;
  members?: HydratedUserResponseDto[];
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

  @ApiPropertyOptional({
    description: '블로그에 속해 있는 유저들 정보',
    type: [HydratedUserResponseDto],
  })
  readonly members?: HydratedUserResponseDto[];

  constructor(props: CreateHydratedBlogProps) {
    super(props);

    this.name = props.name;
    this.members = props.members;
  }
}
