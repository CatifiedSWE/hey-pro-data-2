'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Gigs Page - Redirects to Manage Gigs
 * 
 * This page redirects users to the main gig management interface.
 */
export default function GigsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/gigs/manage');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA6E80]"></div>
        <p className="mt-4 text-gray-600">Redirecting to Manage Gigs...</p>
      </div>
    </div>
  );
}
