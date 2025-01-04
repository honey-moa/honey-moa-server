import { ApiProperty } from '@nestjs/swagger';
import { USER_PASSWORD_REGEXP } from '@src/apis/user/types/user.constant';
import { Matches } from 'class-validator';

export class UpdatePasswordRequestDto {
  @ApiProperty({
    description: '새로운 비밀번호',
    minLength: 1,
    maxLength: 255,
    pattern: `${USER_PASSWORD_REGEXP}`,
  })
  @Matches(USER_PASSWORD_REGEXP)
  newPassword: string;
}
