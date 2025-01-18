import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';

export interface CreateHydratedUserProps extends CreateBaseResponseDtoProps {
  nickname: string;
}

export class HydratedUserResponseDto
  extends BaseResponseDto
  implements Omit<CreateHydratedUserProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '홍길동이에오',
    description: '유저 닉네임',
    minLength: 1,
    maxLength: 20,
  })
  readonly nickname: string;

  constructor(props: CreateHydratedUserProps) {
    super(props);

    this.nickname = props.nickname;
  }
}
