import type { TokenType } from '@libs/app-jwt/types/app-jwt.enum';

export interface JwtPayload {
  sub: string;
  tokenType: TokenType;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
