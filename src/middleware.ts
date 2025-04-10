import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Skip processing for static files
  if (pathname.startsWith('/fonts/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  // If URL has the pattern /page/NUMBER, rewrite to /?page=NUMBER
  const pagePathMatch = pathname.match(/^\/page\/(\d+)$/);
  if (pagePathMatch) {
    const pageNumber = pagePathMatch[1];
    url.pathname = '/';
    url.searchParams.set('page', pageNumber);
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/page/:path*',
  ],
}; 