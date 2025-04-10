import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl mb-6">Page Not Found</h1>
        <p className="mb-8 text-gray-700">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 