import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class JwtResponseDto {
  @ApiProperty({
    description: '액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
  })
  @IsOptional()
  refreshToken?: string;

  constructor(create: JwtResponseDto) {
    this.accessToken = create.accessToken;
    this.refreshToken = create.refreshToken;
  }
}
