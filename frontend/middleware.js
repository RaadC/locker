import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
  const token =
    req.cookies.get("token")?.value || req.headers.get("authorization") || null;

  const url = req.nextUrl.pathname;

  const adminPaths = [
    "/dashboard",
    "/register",
    "/users-credit",
    "/set-payment",
    "/add-slots",
    "/control-locker",
    "/locker-logs",
  ];

  const superAdminPaths = ["/account-control"];

  //If token exists and user tries to access login → redirect them away
  if (token && url.startsWith("/admin-login")) {
    try {
      const { payload } = await jwtVerify(token, secret);

      // redirect superadmins to account-control
      if (payload.role === 0) {
        return NextResponse.redirect(new URL("/account-control", req.url));
      }

      // redirect normal admins to dashboard
      if (payload.role === 1) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (err) {
      // token invalid → clear cookie and allow login page
      const res = NextResponse.next();
      res.cookies.delete("token");
      return res;
    }
  }

  //If no token but accessing protected paths → redirect to login
  if (!token) {
    if (
      adminPaths.some((path) => url.startsWith(path)) ||
      superAdminPaths.some((path) => url.startsWith(path))
    ) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    //Superadmin-only restriction
    if (superAdminPaths.some((path) => url.startsWith(path))) {
      if (payload.role !== 0) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    //Admin routes (both 0 = superadmin, 1 = admin allowed)
    if (adminPaths.some((path) => url.startsWith(path))) {
      if (![0, 1].includes(payload.role)) {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
    }
  } catch (err) {
    console.error("JWT verification failed in middleware:", err);
    return NextResponse.redirect(new URL("/admin-login", req.url));
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
    "/locker-logs/:path*",
    "/account-control/:path*",
    "/admin-login",
  ],
};
