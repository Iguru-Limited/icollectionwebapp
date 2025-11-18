"use client";
import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewForm, type Crew } from '@/components/crews';

interface EditCrewPageProps { params: { id: string } }

export default function EditCrewPage({ params }: EditCrewPageProps) {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/crews/${params.id}`);
      const json = await res.json();
      setCrew(json.data ?? null);
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref={`/user/crews/${params.id}`} />
        <div className="flex items-center justify-center h-screen">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Edit Crew Member" backHref={`/user/crews/${params.id}`} />
      <main className="px-4 pb-24 max-w-sm mx-auto">
        {crew && <CrewForm mode="edit" crew={crew} />}
      </main>
    </PageContainer>
  );
}
