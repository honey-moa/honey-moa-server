import { ApiProperty } from '@nestjs/swagger';

export class JwtResponseDto {
  @ApiProperty({
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
  })
  refreshToken?: string;

  constructor(create: JwtResponseDto) {
    this.accessToken = create.accessToken;
    this.refreshToken = create.refreshToken;
  }
}
