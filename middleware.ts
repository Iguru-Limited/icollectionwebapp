import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Guard the /user area directly
  const isUserArea = pathname.startsWith('/user');
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isUserArea && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isUserArea && token) {
    const userRole = token.role;
    if (userRole && userRole !== 'user') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user is authenticated and trying to access login page, redirect to appropriate dashboard
  if (token && pathname === '/login') {
    const userRole = token.role;
    console.log(
      `Authenticated user with role '${userRole}' accessing login page - redirecting to dashboard`,
    );
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }

  // If user is authenticated and accessing root, redirect to appropriate dashboard
  if (token && pathname === '/') {
    const userRole = token.role;
    console.log(
      `Authenticated user with role '${userRole}' accessing root - redirecting to dashboard`,
    );
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }
  // Allow access to public routes and authenticated users
  return NextResponse.next();
}
// Configure which routes the middleware should run on
export const config = {
  // Run middleware only on protected and relevant top-level routes
  matcher: ['/user/:path*', '/', '/login'],
};
