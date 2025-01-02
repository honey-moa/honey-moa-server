import { ApiProperty } from '@nestjs/swagger';

export class JwtResponseDto {
  @ApiProperty({
    description: '액세스 토큰',
  })
  accessToken: string;

  constructor(create: JwtResponseDto) {
    this.accessToken = create.accessToken;
  }
}
