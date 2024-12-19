import { ApiProperty } from '@nestjs/swagger';
import { UserLoginType, UserRole } from '@src/apis/user/types/user.constant';
import {
  UserLoginTypeUnion,
  UserRoleUnion,
} from '@src/apis/user/types/user.type';
import {
  BaseResponseDto,
  CreateBaseResponseDtoProps,
} from '@src/libs/api/dtos/response/base.response-dto';

export interface CreateUserResponseDtoProps extends CreateBaseResponseDtoProps {
  name: string;
  email: string;
  loginType: UserLoginTypeUnion;
  role: UserRoleUnion;
}

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: '홍길동',
    description: '유저 이름',
    minLength: 1,
    maxLength: 20,
  })
  readonly name: string;

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
    enum: [Object.values(UserLoginType)],
  })
  readonly loginType: UserLoginTypeUnion;

  @ApiProperty({
    example: 'user',
    description: '유저 역할',
    enum: [Object.values(UserRole)],
  })
  readonly role: UserRoleUnion;

  constructor(create: CreateUserResponseDtoProps) {
    super(create);

    const { name, role, email, loginType } = create;

    this.name = name;
    this.email = email;
    this.loginType = loginType;
    this.role = role;
  }
}
