'use client';

import { Suspense } from 'react';
import MainContent from './MainContent';

// For server components in Next.js 15, we need to declare it
// to receive searchParams
export default function Home({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Default to page 1
  const initialPage = 1;
  // Set a timestamp for cache-busting
  const timestamp = Date.now();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <MainContent initialPage={initialPage} key={`content-${timestamp}`} />
        <div className="fixed bottom-2 right-2 text-xs text-gray-400">
          Updated: just now
        </div>
      </div>
    </Suspense>
  );
} 