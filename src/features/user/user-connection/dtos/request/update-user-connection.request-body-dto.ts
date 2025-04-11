import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import type { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { ApiProperty } from '@nestjs/swagger';
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
