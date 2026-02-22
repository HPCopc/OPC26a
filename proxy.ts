// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import outputs from '@/amplify_outputs.json';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch (error) {
        return false;
      }
    },
  });

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/login',
    '/resources',
    '/_next',
    '/favicon.ico'
  ];

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/_next')
  );

  // Allow public routes
  if (isPublicRoute) {
    return response;
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};