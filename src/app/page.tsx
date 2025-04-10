// This is a Server Component
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Interface to match PageProps constraint for Next.js with Netlify
type RawSearchParams = { [key: string]: string | string[] | undefined };

// Dynamically import the client page component
const ClientContent = dynamic(() => import('./ClientPage'), {
  loading: () => <p>Loading content...</p>,
  ssr: false
});

// Define our Home component as a standard component, not async
export default function Home() {
  return (
    <div className="min-h-screen">
      <h1 className="text-center pt-16 text-3xl font-bold">Found Fonts Foundry</h1>
      <p className="text-center mt-4">Loading fonts collection...</p>
    </div>
  );
} 