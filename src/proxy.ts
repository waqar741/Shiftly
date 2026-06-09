import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js internals, and public API paths
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Try reading token from Authorization header first (for API calls)
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Fall back to cookie (for page loads)
    token = request.cookies.get('token')?.value;
  }

  const isApiRoute = pathname.startsWith('/api/v1/');

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' } },
        { status: 401 }
      );
    } else {
      // Redirect to login page for frontend routes
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const payload = await verifyToken(token);

  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token expired or invalid' } },
        { status: 401 }
      );
    } else {
      // Clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Clone headers and add user info for the API routes to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id as string);
  requestHeaders.set('x-user-role', payload.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
