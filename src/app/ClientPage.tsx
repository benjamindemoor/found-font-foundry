'use client';

import { useState, useEffect } from 'react';
import MainContent from './MainContent';

interface ClientPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
  initialPage?: number;
}

export default function ClientPage({ searchParams = {}, initialPage = 1 }: ClientPageProps) {
  // Set initialPage based on props or searchParams
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [timestamp] = useState(() => Date.now());
  
  // Process searchParams on the client side
  useEffect(() => {
    const pageParam = searchParams?.page;
    if (pageParam) {
      const pageNum = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam, 10);
      if (!isNaN(pageNum)) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen">
      <MainContent initialPage={currentPage} key={`content-${timestamp}`} />
      <div className="fixed bottom-2 right-2 text-xs text-gray-400">
        Updated: just now
      </div>
    </div>
  );
} 