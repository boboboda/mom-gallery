import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn =
    verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;

  if (pathname === "/admin/login") {
    // 이미 로그인했으면 로그인 화면 대신 관리자 홈으로
    if (loggedIn) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};