// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import { hasCognitoSession } from '@/utils/authCookies';

// Detail pages of the protected topics (news, videos, whitepapers) need a
// signed-in user; their list/category pages stay public. Events and
// resources are public all the way down.
function isDetailPage(seg: string[]) {
  switch (seg[0]) {
    case 'whitepapers':
      return seg.length === 2; // /whitepapers/<slug>
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

  const { signedIn, groups, failed } = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return {
          signedIn: session.tokens !== undefined,
          groups: (session.tokens?.accessToken.payload['cognito:groups'] as string[] | undefined) ?? [],
          failed: false,
        };
      } catch {
        return { signedIn: false, groups: [] as string[], failed: true };
      }
    },
  });

  // The session check itself failed (network, Cognito hiccup) while the user
  // has a session cookie: they are probably still signed in, so don't send
  // them to /login (which would bounce them straight back, possibly in a loop).
  if (failed && hasCognitoSession(request.cookies.getAll().map((c) => c.name))) {
    return new NextResponse(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Temporarily unavailable</title>' +
        '<div style="font-family:sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;text-align:center">' +
        '<p>We couldn&#39;t check your sign-in just now. Please try again in a moment.</p>' +
        '<p><a href="javascript:location.reload()">Try again</a></p></div>',
      { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '5' } },
    );
  }

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
