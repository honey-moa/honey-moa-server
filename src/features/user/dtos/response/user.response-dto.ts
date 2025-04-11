import { UserLoginType, UserMbti } from '@features/user/types/user.constant';
import type {
  UserLoginTypeUnion,
  UserMbtiUnion,
} from '@features/user/types/user.type';
import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@libs/api/dtos/response/base.response-dto';
import { ApiProperty } from '@nestjs/swagger';

export interface CreateUserResponseDtoProps extends CreateBaseResponseDtoProps {
  nickname: string;
  email: string;
  loginType: UserLoginTypeUnion;
  mbti: UserMbtiUnion | null;
  isEmailVerified: boolean;
  profileImageUrl: string | null;
}

export class UserResponseDto
  extends BaseResponseDto
  implements Omit<CreateUserResponseDtoProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '홍길동이에오',
    description: '유저 닉네임',
    minLength: 1,
    maxLength: 20,
  })
  readonly nickname: string;

  @ApiProperty({
    example: 'temp@temp.temp',
    format: 'email',
    description: '유저 이메일',
    minLength: 1,
    maxLength: 255,
  })
  readonly email: string;

  @ApiProperty({
    example: 'email',
    description: '유저 로그인 타입',
    enum: UserLoginType,
  })
  readonly loginType: UserLoginTypeUnion;

  @ApiProperty({
    example: 'ISTP',
    description: '유저 MBTI',
    enum: UserMbti,
    nullable: true,
  })
  readonly mbti: UserMbtiUnion | null;

  @ApiProperty({
    example: 'false',
    description: '유저의 이메일 인증 여부',
  })
  readonly isEmailVerified: boolean;

  @ApiProperty({
    description: '유저 프로필 이미지 url',
    format: 'uri',
    nullable: true,
  })
  readonly profileImageUrl: string | null;

  constructor(create: CreateUserResponseDtoProps) {
    super(create);

    const {
      nickname,
      email,
      loginType,
      mbti,
      isEmailVerified,
      profileImageUrl,
    } = create;

    this.nickname = nickname;
    this.email = email;
    this.loginType = loginType;
    this.mbti = mbti;
    this.isEmailVerified = isEmailVerified;
    this.profileImageUrl = profileImageUrl;
  }
}
