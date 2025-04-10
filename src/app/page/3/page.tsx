// This is a Server Component
import { Suspense } from 'react';
import ClientPage from '../../ClientPage';

// Static page for /page/3
export default function Page3() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div>
          <h1 className="text-center pt-16 text-3xl font-bold">Found Fonts Foundry</h1>
          <p className="text-center mt-4">Loading fonts collection...</p>
        </div>
      }>
        <ClientPage initialPage={3} />
      </Suspense>
    </div>
  );
} 