import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MainContent with no SSR to avoid hydration issues
const MainContentClient = dynamic(() => import('./MainContent'), { ssr: false });

// Define the page as an async server component for Next.js 15 compatibility
export default async function Home({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get page from search params or default to 1
  const pageParam = searchParams?.page;
  const initialPage = pageParam ? parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam, 10) : 1;
  
  // Set a timestamp for cache-busting
  const timestamp = Date.now();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <MainContentClient initialPage={initialPage} key={`content-${timestamp}`} />
        <div className="fixed bottom-2 right-2 text-xs text-gray-400">
          Updated: just now
        </div>
      </div>
    </Suspense>
  );
} 