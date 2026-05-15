import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/jwt';

/**
 * Route protection for the two authenticated areas.
 *  - /admin/*    requires role `museum_admin`
 *  - /operator/* requires role `operator`
 * Login pages are always public. If a vendor still has the
 * `mustChangePassword` flag set, every admin page except `/admin/password`
 * forwards them to the password-change form.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminLogin = pathname === '/admin/login';
  const isOperatorLogin = pathname === '/operator/login';
  const isAdminPasswordPage = pathname === '/admin/password';
  const isAdminArea = pathname.startsWith('/admin') && !isAdminLogin;
  const isOperatorArea = pathname.startsWith('/operator') && !isOperatorLogin;

  if (!isAdminArea && !isOperatorArea) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (isAdminArea) {
    if (!session || session.role !== 'museum_admin') {
      return redirectTo(req, '/admin/login');
    }
    if (session.mustChangePassword && !isAdminPasswordPage) {
      return redirectTo(req, '/admin/password');
    }
  }

  if (isOperatorArea) {
    if (!session || session.role !== 'operator') {
      return redirectTo(req, '/operator/login');
    }
  }

  return NextResponse.next();
}

function redirectTo(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*', '/operator/:path*'],
};
