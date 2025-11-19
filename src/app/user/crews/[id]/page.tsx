"use client";
import { use } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewBioData, CrewDetailHeader } from '@/components/crews';
import { useCrew } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

interface CrewProfilePageProps { params: Promise<{ id: string }> }

export default function CrewProfilePage({ params }: CrewProfilePageProps) {
  const { id } = use(params);
  const { crew, isLoading, error } = useCrew(id);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96 text-red-600">
          Error loading crew: {error.message}
        </div>
      </PageContainer>
    );
  }

  if (!crew) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96 text-gray-500">
          Crew member not found
        </div>
      </PageContainer>
    );
  }

  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader title="" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <CrewDetailHeader
          crew={crew}
          active={'bio'}
          onSelect={(key) => {
            if (key === 'bio') router.push(`/user/crews/${crew.crew_id}/bio`);
            if (key === 'history') router.push(`/user/crews/${crew.crew_id}/history`);
          }}
        />
      </main>
    </PageContainer>
  );
}
