"use client";
import { use } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewForm } from '@/components/crews';
import { useCrew } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';

interface EditCrewPageProps { params: Promise<{ id: string }> }

export default function EditCrewPage({ params }: EditCrewPageProps) {
  const { id } = use(params);
  const { crew, isLoading, error } = useCrew(id);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref={`/user/crews/${id}`} />
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref={`/user/crews/${id}`} />
        <div className="flex items-center justify-center h-96 text-red-600">
          Error loading crew: {error.message}
        </div>
      </PageContainer>
    );
  }

  if (!crew) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96 text-gray-500">
          Crew member not found
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Edit Crew Member" backHref={`/user/crews/${id}`} />
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <CrewForm mode="edit" crew={crew} />
      </main>
    </PageContainer>
  );
}
