'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { farmById, farmPath } from '@/lib/farms-data';

// Old links (/dashboard?farm=<id>) now live under /farms/<state>/<id>.
function Redirect() {
  const router = useRouter();
  const id = useSearchParams().get('farm');
  useEffect(() => {
    const farm = id ? farmById(id) : undefined;
    router.replace(farm ? farmPath(farm) : '/overview');
  }, [id, router]);
  return null;
}

export default function DashboardRedirect() {
  return <Suspense fallback={null}><Redirect /></Suspense>;
}
