'use client';

import { useState, useEffect } from 'react';
import MainContent from './MainContent';

interface ClientMainContentProps {
  initialPage?: number;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ClientMainContent({ 
  initialPage: defaultInitialPage = 1,
  searchParams = {}
}: ClientMainContentProps) {
  const [initialPage, setInitialPage] = useState(defaultInitialPage);
  const [timestamp] = useState(() => Date.now());
  
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
  
  return (
    <MainContent initialPage={initialPage} key={`content-${timestamp}`} />
  );
} 