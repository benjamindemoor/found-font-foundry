import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is currently disabled to prevent conflicts with App Router routing
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  // Check if the path matches /page/{number}
  const pagePathMatch = pathname.match(/^\/page\/(\d+)$/);
  if (pagePathMatch) {
    const pageNumber = parseInt(pagePathMatch[1], 10);
    
    // We have static routes for pages 1, 2, and 3
    if (pageNumber >= 1 && pageNumber <= 3) {
      // These static routes exist, let them handle the request
      return NextResponse.next();
    } else {
      // For other page numbers, redirect to page 1
      url.pathname = '/page/1';
      return NextResponse.redirect(url);
    }
  }
  
  // Let the request proceed without modification
  return NextResponse.next();
}

// Keep the config minimal or remove if middleware is not needed elsewhere
export const config = {
  matcher: ['/page/:path*'],
}; 