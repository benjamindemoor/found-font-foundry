'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl mb-6">Something went wrong</h1>
        <p className="mb-8 text-gray-700">
          We apologize for the inconvenience. Our team has been notified of this issue.
        </p>
        <button
          onClick={reset}
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 