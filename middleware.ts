import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/user': ['user'],
    '/user/collection': ['user'],
  };


  // Check if the current path requires authentication
  const requiresAuth = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  // Get the token from the request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If route requires authentication but user is not authenticated
  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated, check role-based access
  if (token && requiresAuth) {
    const userRole = token.role;
    
    // Find the matching route and check if user has required role
    const matchedRoute = Object.entries(protectedRoutes).find(([route]) => 
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const [, allowedRoles] = matchedRoute;
      
      // Check if user's role is allowed for this route
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'user') {
          return NextResponse.redirect(new URL('/user', request.url));
        }
        // For other roles, send to login for now
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Role is allowed; fall through to NextResponse.next()
    }
  }

  // If user is authenticated and trying to access login page, redirect to appropriate dashboard
  if (token && pathname === '/login') {
    const userRole = token.role;
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/user', request.url));
    } 
  }

  // If user is authenticated and accessing root, redirect to appropriate dashboard
  if (token && pathname === '/') {
    const userRole = token.role;
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/user', request.url));    
    } 
  }

  // Allow access to public routes and authenticated users
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes - allow these)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - _vercel (Vercel internal routes)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|_vercel|robots.txt|sitemap.xml).*)',
  ],
};
