import { ICookieStore } from '@/feature/auth/cookie-handler';
import { NextRequest, NextResponse } from 'next/server';

export class MiddleWareCookieStore implements ICookieStore {
  constructor(
    private request: NextRequest,
    private response: NextResponse,
  ) {}

  get(key: string) {
    return this.request.cookies.get(key)?.value;
  }

  set(
    key: string,
    value: string,
    option: { httpOnly: boolean; expires: Date },
  ) {
    this.response.cookies.set(key, value, option);
  }
}
