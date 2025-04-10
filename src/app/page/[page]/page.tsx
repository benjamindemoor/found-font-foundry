// This is a Server Component
import { Suspense } from 'react';
import ClientPage from '../../ClientPage';
import { notFound } from 'next/navigation';

// Remove explicit PageProps interface and type annotation
// interface PageProps {
//   params: {
//     page: string;
//   };
//   searchParams?: { [key: string]: string | string[] | undefined };
// }

// Let TypeScript infer the props type
const Page = ({ params }: { params: { page: string } }) => {
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
};

export default Page; 