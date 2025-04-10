// This is a Server Component
import { Suspense } from 'react';
import ClientPage from '../../ClientPage';
import { notFound } from 'next/navigation';

// Use a minimal props type to avoid conflicts with Netlify
type SimpleParams = {
  params: any; // Using 'any' intentionally to avoid Netlify type conflicts
};

// Export a simple async function with minimal typing
export default async function Page({ params }: SimpleParams) {
  // Simple validation
  const pageNumber = parseInt(params.page, 10);
  
  // Validate page number
  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound();
  }
  
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div>
          <h1 className="text-center pt-16 text-3xl font-bold">Found Fonts Foundry</h1>
          <p className="text-center mt-4">Loading fonts collection...</p>
        </div>
      }>
        <ClientPage initialPage={pageNumber} />
      </Suspense>
    </div>
  );
} 