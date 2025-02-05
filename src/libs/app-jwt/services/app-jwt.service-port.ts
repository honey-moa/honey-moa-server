import type { JwtPayload } from '@libs/app-jwt/types/app-jwt.interface';

export interface AppJwtServicePort {
  generateToken(payload: JwtPayload): Promise<string>;
  verifyToken(token: string): Promise<JwtPayload>;
}
