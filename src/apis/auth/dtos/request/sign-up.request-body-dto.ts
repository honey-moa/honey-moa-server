import { ApiProperty } from '@nestjs/swagger';
import {
  USER_PASSWORD_REGEXP,
  UserMbti,
} from '@src/apis/user/types/user.constant';
import { UserMbtiUnion } from '@src/apis/user/types/user.type';
import { IsEmail, IsEnum, Length, Matches } from 'class-validator';

export class SignUpRequestBodyDto {
  @ApiProperty({
    description: '유저 이름',
    minLength: 1,
    maxLength: 20,
  })
  @Length(1, 20)
  name: string;

  @ApiProperty({
    description: '유저 닉네임',
    minLength: 1,
    maxLength: 20,
  })
  @Length(1, 20)
  nickname: string;

  @ApiProperty({
    description: '유저 이메일',
    minLength: 1,
    maxLength: 255,
  })
  @Length(1, 255)
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      '유저 패스워드.\n8자 이상 15자 이하의 길이를 가지며, 최소 하나의 영문자, 하나의 숫자, 하나의 특수문자',
    minLength: 1,
    maxLength: 255,
    pattern: `${USER_PASSWORD_REGEXP}`,
  })
  @Length(1, 255)
  @Matches(USER_PASSWORD_REGEXP)
  password: string;

  @ApiProperty({
    description: '유저 MBTI',
    enum: UserMbti,
  })
  @Length(1, 255)
  @IsEnum(UserMbti)
  mbti: UserMbtiUnion;
}
