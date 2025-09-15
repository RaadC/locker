import { NextResponse } from "next/server";

export function middleware(req) {
  const token =
    req.cookies.get("token")?.value || req.headers.get("authorization") || null;

  // pages that require auth
  const protectedPaths = [
    "/dashboard",
    "/register",
    "/users-credit",
    "/set-payment",
    "/add-slots",
    "/control-locker",
    "/locker-logs"
  ];
  const url = req.nextUrl.pathname;

  if (protectedPaths.some((path) => url.startsWith(path))) {
    if (!req.cookies.has("token") && !token) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/register/:path*",
    "/users-credit/:path*",
    "/set-payment/:path*",
    "/add-slots/:path*",
    "/control-locker/:path*",
    "/locker-logs/:path*"
  ],
};
