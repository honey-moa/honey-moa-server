import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SendPasswordChangeVerificationEmailRequestDto {
  @ApiProperty({
    description: '연결 될 비밀번호 변경 페이지 url',
    format: 'uri',
  })
  @IsUrl({
    require_tld: false,
  })
  connectUrl: string;
}
