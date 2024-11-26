// middleware.ts
import { CookieTokenHandler } from '@/feature/auth/cookie-handler';
import { jwtHandler } from '@/feature/auth/jwt-handler';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(CookieTokenHandler.TOKEN_KEY)?.value;
  const payload = await jwtHandler.verifyToken(token);
  console.log('request.nextUrl.href: ', request.nextUrl.href);
  console.log('payload: ', payload);
  const isAuthenticated = !!payload;

  // /login 경로는 로그인 상태라면 /employee로 리다이렉트
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (isAuthenticated)
      return NextResponse.redirect(new URL('/employee', request.url));

    return NextResponse.next();
  }

  // 모든 경로는 로그인 상태여야 함
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 경로를 제외한 모든 경로
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
