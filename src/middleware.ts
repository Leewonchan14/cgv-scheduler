// middleware.ts
import { CookieTokenHandler } from '@/feature/auth/cookie-handler';
import { jwtHandler } from '@/feature/auth/jwt-handler';
import { MiddleWareCookieStore } from '@/feature/auth/middleware-cookie.store';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookieTokenHandler = new CookieTokenHandler(
    new MiddleWareCookieStore(request, response),
  );
  const token = cookieTokenHandler.get();
  const payload = await jwtHandler.verifyToken(token);
  const isAuthenticated = !!payload;

  // 인증 상태라면 토큰 업데이트
  if (isAuthenticated) {
    await cookieTokenHandler.update(payload);
  }

  // /login 경로는 로그인 상태라면 /employee로 리다이렉트
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (isAuthenticated)
      return NextResponse.redirect(new URL('/employee', request.url));

    return response;
  }

  // 모든 경로는 로그인 상태여야 함
  if (!payload) {
    cookieTokenHandler.clear();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// 경로를 제외한 모든 경로
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
