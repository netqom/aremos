import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [/^\/dashboard/, /^\/decks/, /^\/classrooms/];
const PUBLIC_ROUTES = [/^\/login/, /^\/register/, /^\/$/];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY || "aremos_token")?.value;
  const url = req.nextUrl.pathname;
  
  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((pattern) => pattern.test(url));
  const isPublicRoute = PUBLIC_ROUTES.some((pattern) => pattern.test(url));
  
  // If user has token and tries to access login/register, redirect to dashboard
  if (token && isPublicRoute) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }
  
  // If no token and trying to access protected route, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow all other requests to continue
  return NextResponse.next();
}

export const config = { 
  matcher: ["/dashboard/:path*", "/decks/:path*", "/classrooms/:path*", "/login", "/register", "/"] 
};