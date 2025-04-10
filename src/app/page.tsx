'use client';

import { Suspense } from 'react';
import MainContent from './MainContent';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="loading-text">searching...</div>
      </div>
    </div>
  );
}

// Main Page component with nested Suspense boundaries
export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MainContent initialPage={1} />
    </Suspense>
  );
} 