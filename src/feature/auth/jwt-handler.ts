import { ERole } from '@/entity/enums/ERole';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export interface IPayLoad extends JWTPayload {
  id: number;
  role: ERole;
}

export class JWTHandler {
  static TOKEN_EXPIRE_PERIOD = 1000 * 60 * 60 * 2;

  createToken(payload: IPayLoad) {
    const newDate = Date.now() + JWTHandler.TOKEN_EXPIRE_PERIOD;
    return new SignJWT(payload)
      .setExpirationTime(newDate)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key);
  }

  async verifyToken(token?: string | null) {
    try {
      const decoded = await jwtVerify(token!, key);
      return decoded.payload as IPayLoad;
    } catch (_error) {
      return null;
    }
  }
}

export const jwtHandler = new JWTHandler();
