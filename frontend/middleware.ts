import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@/zustand/types/user";

const PROTECTED_ROUTES: Record<string, number[]> = {
  "/admin/": [2, 1], // admin (2) and instructor (1) can access admin routes
  "/instructor/": [1, 2], // instructor and admin
  "/student/": [0, 1, 2], // all roles
};

const PUBLIC_ROUTES = ["/login", "/", "/api"];

function handleAuthenticatedRedirect(
  request: NextRequest,
): NextResponse | null {
  const token = request.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as { role: UserRole };
    const userRole = decoded.role;
    const pathname = request.nextUrl.pathname;

    // If authenticated user is on login page or root, redirect them
    if (pathname === "/login" || pathname === "/") {
      let redirectPath = "/";

      switch (userRole) {
        case 2: // Admin
          redirectPath = "/admin/user";
          break;
        case 1: // Instructor
          redirectPath = "/admin/module";
          break;
        case 0: // Student
          redirectPath = "/student/student-dashboard";
          break;
      }

      if (redirectPath !== "/") {
        console.log(`Authenticated ${userRole} redirecting to ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  } catch (error) {
    // Silently fail
  }

  return null;
}

function checkAuthAndRole(
  request: NextRequest,
  requiredRoles: number[],
): NextResponse | null {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwt.decode(token) as { role: UserRole };
    const userRole = decoded.role;

    if (!requiredRoles.includes(userRole)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return null;
  } catch (error) {
    console.error(
      "JWT decode error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function getRequiredRoles(pathname: string): number[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First, check if authenticated user should be redirected from root/login
  const authRedirect = handleAuthenticatedRedirect(request);
  if (authRedirect) return authRedirect;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles) {
    const authResponse = checkAuthAndRole(request, requiredRoles);
    if (authResponse) {
      return authResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
  runtime: "nodejs",
};
