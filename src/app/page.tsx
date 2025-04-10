'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import MainContent from './MainContent';

export default function Home({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get page from search params or default to 1
  const [initialPage, setInitialPage] = useState(1);
  
  // Process search params on client side
  useEffect(() => {
    const pageParam = searchParams?.page;
    if (pageParam) {
      const pageNum = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam, 10);
      if (!isNaN(pageNum)) {
        setInitialPage(pageNum);
      }
    }
  }, [searchParams]);
  
  // Generate a timestamp for cache-busting
  const [timestamp] = useState(() => Date.now());
  
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