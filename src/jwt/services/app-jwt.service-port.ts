import { JwtPayload } from '@src/jwt/types/app-jwt.interface';

export interface AppJwtServicePort {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(accessToken: string): Promise<JwtPayload>;
}
