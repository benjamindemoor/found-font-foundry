import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues
const ClientMainContent = dynamic(() => import('./ClientMainContent'), { ssr: false });

// Interface to match PageProps constraint
interface PageProps {
  searchParams?: Promise<any>;
}

// Define as async function to satisfy the Promise requirement
export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Default to page 1
  const initialPage = 1;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <ClientMainContent initialPage={initialPage} searchParams={searchParams} />
        <div className="fixed bottom-2 right-2 text-xs text-gray-400">
          Updated: just now
        </div>
      </div>
    </Suspense>
  );
} 