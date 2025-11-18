"use client";
import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewProfile, type Crew } from '@/components/crews';

interface CrewProfilePageProps { params: { id: string } }

export default function CrewProfilePage({ params }: CrewProfilePageProps) {
  const [crew, setCrew] = useState<Crew | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/crews/${params.id}`);
      const json = await res.json();
      setCrew(json.data ?? null);
    })();
  }, [params.id]);

  if (!crew) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-screen">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Crew Profile" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-sm mx-auto">
        <CrewProfile crew={crew} />
      </main>
    </PageContainer>
  );
}
