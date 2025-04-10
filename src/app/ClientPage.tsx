'use client';

import { useState, useEffect } from 'react';
import MainContent from './MainContent';

interface ClientPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ClientPage({ searchParams = {} }: ClientPageProps) {
  // Set initialPage based on searchParams or default to 1
  const [initialPage, setInitialPage] = useState(1);
  const [timestamp] = useState(() => Date.now());
  
  // Process searchParams on the client side
  useEffect(() => {
    const pageParam = searchParams?.page;
    if (pageParam) {
      const pageNum = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam, 10);
      if (!isNaN(pageNum)) {
        setInitialPage(pageNum);
      }
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen">
      <MainContent initialPage={initialPage} key={`content-${timestamp}`} />
      <div className="fixed bottom-2 right-2 text-xs text-gray-400">
        Updated: just now
      </div>
    </div>
  );
} 