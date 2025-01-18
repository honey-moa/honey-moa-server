import { ApiProperty } from '@nestjs/swagger';
import { UserConnectionStatus } from '@features/user/types/user.constant';
import { UserConnectionStatusUnion } from '@features/user/types/user.type';
import { IsEnum } from 'class-validator';

export class UpdateUserConnectionRequestBodyDto {
  @ApiProperty({
    description:
      '업데이트 할 상태.<br>' +
      'ACCEPTED: 수락<br>' +
      'REJECTED: 거절<br>' +
      'CANCELED: 취소',
    enum: [
      UserConnectionStatus.ACCEPTED,
      UserConnectionStatus.REJECTED,
      UserConnectionStatus.CANCELED,
    ],
  })
  @IsEnum({
    ACCEPTED: UserConnectionStatus.ACCEPTED,
    REJECTED: UserConnectionStatus.REJECTED,
    CANCELED: UserConnectionStatus.CANCELED,
  })
  readonly status: Exclude<
    UserConnectionStatusUnion,
    'PENDING' | 'DISCONNECTED'
  >;
}
