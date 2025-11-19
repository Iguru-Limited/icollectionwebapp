"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewForm } from '@/components/crews';
import { useCrew } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';

interface EditCrewPageProps { params: { id: string } }

export default function EditCrewPage({ params }: EditCrewPageProps) {
  const { crew, isLoading, error } = useCrew(params.id);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref={`/user/crews/${params.id}`} />
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Edit Crew Member" backHref={`/user/crews/${params.id}`} />
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
      <PageHeader title="Edit Crew Member" backHref={`/user/crews/${params.id}`} />
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <CrewForm mode="edit" crew={crew} />
      </main>
    </PageContainer>
  );
}
