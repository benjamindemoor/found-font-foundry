import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware to reduce potential issues
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Handle clean URLs for pagination
  const pagePathMatch = pathname.match(/^\/page\/(\d+)$/);
  if (pagePathMatch) {
    const pageNumber = pagePathMatch[1];
    url.pathname = '/';
    url.searchParams.set('page', pageNumber);
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Limit middleware to only run on specific paths
export const config = {
  matcher: ['/page/:path*'],
}; 