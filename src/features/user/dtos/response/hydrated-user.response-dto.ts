import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';

export interface CreateHydratedUserProps extends CreateBaseResponseDtoProps {
  nickname: string;
  profileImageUrl: string | null;
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

  @ApiProperty({
    description: '유저 프로필 이미지 url',
    format: 'uri',
    nullable: true,
  })
  readonly profileImageUrl: string | null;

  constructor(props: CreateHydratedUserProps) {
    super(props);

    this.nickname = props.nickname;
    this.profileImageUrl = props.profileImageUrl;
  }
}
