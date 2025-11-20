"use client";
// Deprecated standalone history page. History now loads inline on /user/crews/[id].
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CrewHistoryPageProps { params: Promise<{ id: string }> }

export default function CrewHistoryPage({ params }: CrewHistoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/user/crews/${id}`);
  }, [router, id]);
  return null;
}
