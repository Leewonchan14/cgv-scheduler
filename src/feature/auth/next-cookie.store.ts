import { ICookieStore } from '@/feature/auth/cookie-handler';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

class NextCookieStore implements ICookieStore {
  static getInstance(cookieStore: ReadonlyRequestCookies) {
    return new NextCookieStore(cookieStore);
  }

  constructor(private cookieStore: ReadonlyRequestCookies) {}

  get(key: string) {
    return this.cookieStore.get(key)?.value;
  }

  set(key: string, value: string, option?: Partial<ResponseCookie>) {
    this.cookieStore.set(key, value, option);
  }
}

export const nextCookieStore = NextCookieStore.getInstance;
