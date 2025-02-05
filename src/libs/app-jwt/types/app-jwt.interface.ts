import { TokenType } from '@libs/app-jwt/types/jwt.enum';

export interface JwtPayload {
  sub: string;
  exp: string;
  tokenType: TokenType;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
