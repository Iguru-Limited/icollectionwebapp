"use client";
import { use } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewProfile } from '@/components/crews';
import { useCrew } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';

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

  return (
    <PageContainer>
      <PageHeader title="Crew Profile" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <CrewProfile crew={crew} />
      </main>
    </PageContainer>
  );
}
