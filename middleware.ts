// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

// Detail pages need a signed-in user; their list/category pages stay public.
function isDetailPage(seg: string[]) {
  switch (seg[0]) {
    case 'events':
    case 'whitepapers':
      return seg.length === 2; // /events/<slug>
    case 'videos':
      return seg.length === 3; // /videos/<cat>/<slug>
    case 'news':
      return seg.length === 4; // /news/<cat>/<sub>/<slug>
    default:
      return false;
  }
}

const SIGNED_IN_SECTIONS = ['dashboard', 'profile', 'onboarding', 'admin'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const seg = pathname.split('/').filter(Boolean);

  const needsAdmin = seg[0] === 'admin';
  const needsLogin = needsAdmin || isDetailPage(seg) || SIGNED_IN_SECTIONS.includes(seg[0]);

  // Everything else (home, about, resources, list pages) is public.
  if (!needsLogin) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const { signedIn, groups } = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return {
          signedIn: session.tokens !== undefined,
          groups: (session.tokens?.accessToken.payload['cognito:groups'] as string[] | undefined) ?? [],
        };
      } catch {
        return { signedIn: false, groups: [] as string[] };
      }
    },
  });

  if (!signedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (needsAdmin && !groups.includes('ADMINS')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
