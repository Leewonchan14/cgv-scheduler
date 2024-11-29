import { ERole } from '@/entity/enums/ERole';
import {
  CookieTokenHandler,
  ICookieStore,
} from '@/feature/auth/cookie-handler';
import { jwtHandler } from '@/feature/auth/jwt-handler';
import { redirect } from 'next/navigation';

export class AuthHandler {
  constructor() {}

  async isAllowAdmin(cookieStore: ICookieStore) {
    const payload = await this.getSession(cookieStore);
    if (!payload || payload.role !== ERole.ADMIN) {
      redirect('/warning/admin');
    }
  }

  async getSession(cookieStore: ICookieStore) {
    const cookieTokenHandler = new CookieTokenHandler(cookieStore);
    const token = cookieTokenHandler.get();
    return await jwtHandler.verifyToken(token);
  }
}

export const authHandler = new AuthHandler();
