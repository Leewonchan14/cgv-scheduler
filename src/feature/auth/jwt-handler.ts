import { ERole } from '@/entity/enums/ERole';
import { CookieTokenHandler } from '@/feature/auth/cookie-handler';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export interface IPayLoad extends JWTPayload {
  id: number;
  role: ERole;
}

class JWTHandler {
  createToken(payload: IPayLoad) {
    return new SignJWT(payload)
      .setExpirationTime('2h')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key);
  }

  async verifyToken(token?: string | null) {
    try {
      const decoded = await jwtVerify(token!, key);
      return decoded.payload as IPayLoad;
    } catch (_error) {
      console.error(_error);
      return null;
    }
  }

  async updateToken(token: string, cookieHandler: CookieTokenHandler) {
    const payload = await this.verifyToken(token);
    if (!payload) return;
    const newToken = await this.createToken(payload);
    cookieHandler.set(newToken);
  }
}

export const jwtHandler = new JWTHandler();
