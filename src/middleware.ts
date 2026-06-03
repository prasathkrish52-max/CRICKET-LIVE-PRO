import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// NOTE: This middleware assumes @supabase/auth-helpers-nextjs is available.
// If it's not, we will fall back to layout-level protection.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // We check if we are in an admin or scorer route
  const isProtectedPath = 
    req.nextUrl.pathname.startsWith('/admin') || 
    req.nextUrl.pathname.startsWith('/scorer');

  if (!isProtectedPath) return res;

  // For now, since we haven't installed the helpers yet, we will use a 
  // simplified check or a placeholder that the user can finalize once 
  // they install the required auth package.
  
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/scorer/:path*'],
};
