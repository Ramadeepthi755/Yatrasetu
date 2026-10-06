'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function HostsRedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hostId = params?.hostId as string;

  useEffect(() => {
    if (hostId) {
      const queryString = searchParams.toString();
      const target = `/local/${encodeURIComponent(hostId)}${queryString ? `?${queryString}` : ''}`;
      router.replace(target);
    }
  }, [hostId, searchParams, router]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900" />
    </div>
  );
}
