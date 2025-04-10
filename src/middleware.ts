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
    
    // Validate that the page number is positive
    if (isNaN(pageNumber) || pageNumber < 1) {
      // Redirect invalid page numbers to page 1
      url.pathname = '/page/1';
      return NextResponse.redirect(url);
    }
  }
  
  // Let all valid page requests proceed to the dynamic route handler
  return NextResponse.next();
}

// Keep the config minimal or remove if middleware is not needed elsewhere
export const config = {
  matcher: ['/page/:path*'],
}; 