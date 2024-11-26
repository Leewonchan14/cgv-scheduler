import { ICookieStore } from '@/feature/auth/cookie-handler';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest, NextResponse } from 'next/server';

export class MiddleWareCookieStore implements ICookieStore {
  constructor(
    private request: NextRequest,
    private response: NextResponse,
  ) {}

  get(key: string) {
    return this.request.cookies.get(key)?.value;
  }

  set(key: string, value: string, option?: Partial<ResponseCookie>) {
    this.response.cookies.set(key, value, option);
  }
}
