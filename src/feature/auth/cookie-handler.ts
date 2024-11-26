import { IPayLoad, jwtHandler, JWTHandler } from '@/feature/auth/jwt-handler';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export type ICookieStore = {
  get: (key: string) => string | undefined | null;
  set: (key: string, value: string, options?: Partial<ResponseCookie>) => void;
};

export class CookieTokenHandler {
  static COOKIE_TOKEN_KEY = 'token' as const;

  constructor(private cookie: ICookieStore) {}

  set(token: string) {
    this.cookie.set(CookieTokenHandler.COOKIE_TOKEN_KEY, token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + JWTHandler.TOKEN_EXPIRE_PERIOD),
    });
  }

  get() {
    return this.cookie.get(CookieTokenHandler.COOKIE_TOKEN_KEY);
  }

  async update(payload: IPayLoad) {
    this.set(await jwtHandler.createToken(payload));
  }

  clear() {
    this.cookie.set(CookieTokenHandler.COOKIE_TOKEN_KEY, 'null', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
    });
  }
}
