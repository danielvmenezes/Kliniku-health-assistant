import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // In a real app, verify token from cookies/headers
    // For this demo, we rely on client-side localStorage check
    // The dashboard page will redirect to login if no token is found
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
