import { ICookieStore } from '@/feature/auth/cookie-handler';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

class NextCookieStore implements ICookieStore {
  static getInstance(cookieStore: ReadonlyRequestCookies) {
    return new NextCookieStore(cookieStore);
  }

  constructor(private cookieStore: ReadonlyRequestCookies) {}

  get(key: string) {
    return this.cookieStore.get(key)?.value;
  }

  set(
    key: string,
    value: string,
    option: { httpOnly: boolean; expires: Date },
  ) {
    this.cookieStore.set(key, value, option);
  }
}

export const nextCookieStore = NextCookieStore.getInstance;
