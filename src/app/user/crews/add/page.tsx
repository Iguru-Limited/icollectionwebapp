"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewForm } from '@/components/crews';

export default function AddCrewPage() {
  return (
    <PageContainer>
      <PageHeader title="Add New Crew Member" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-sm mx-auto">
        <CrewForm mode="create" />
      </main>
    </PageContainer>
  );
}
