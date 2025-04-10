// This is a Server Component
import { Suspense } from 'react';
import ClientPage from './ClientPage';

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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPage searchParams={searchParams} />
    </Suspense>
  );
} 