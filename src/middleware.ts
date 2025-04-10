import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is currently disabled to prevent conflicts with App Router routing
export function middleware(request: NextRequest) {
  // const url = request.nextUrl.clone();
  // const pathname = url.pathname;
  
  // // Handle clean URLs for pagination
  // const pagePathMatch = pathname.match(/^\/page\/(\d+)$/);
  // if (pagePathMatch) {
  //   const pageNumber = pagePathMatch[1];
  //   url.pathname = '/';
  //   url.searchParams.set('page', pageNumber);
  //   return NextResponse.rewrite(url);
  // }
  
  // Let the request proceed without modification
  return NextResponse.next();
}

// Keep the config minimal or remove if middleware is not needed elsewhere
export const config = {
  // matcher: ['/page/:path*'], // Temporarily disable matcher if not needed
}; 