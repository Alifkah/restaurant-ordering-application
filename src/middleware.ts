import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  // 1. Redirect logged-in users away from /login and /register
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    if (userRole === "staff") {
      return NextResponse.redirect(new URL("/kitchen", nextUrl));
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 2. Admin Routes: /admin/* and /api/admin/*
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  if (isAdminRoute || isAdminApiRoute) {
    if (!isLoggedIn) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
      );
    }

    if (userRole !== "admin") {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // 3. Kitchen / Staff Routes: /kitchen/* and /api/realtime/kitchen
  const isKitchenRoute = pathname.startsWith("/kitchen");
  const isKitchenApiRoute = pathname.startsWith("/api/realtime/kitchen");
  if (isKitchenRoute || isKitchenApiRoute) {
    if (!isLoggedIn) {
      if (isKitchenApiRoute) {
        return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
      );
    }

    if (userRole !== "staff" && userRole !== "admin") {
      if (isKitchenApiRoute) {
        return NextResponse.json({ error: "Forbidden. Kitchen staff or Admin privileges required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // 4. Customer Protected Routes: /account/* and /orders/*
  const isCustomerAccountRoute = pathname.startsWith("/account");
  const isOrdersRoute = pathname.startsWith("/orders");
  if (isCustomerAccountRoute || isOrdersRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
