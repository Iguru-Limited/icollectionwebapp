"use client";
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function VehicleSearchPage() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <PageContainer>
      <PageHeader title="Search vehicles" />
      <main className="px-4 pb-24 max-w-md mx-auto space-y-6">
        <button
          onClick={() => router.push('/user/vehicles')}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Type to search (coming soon)"
        />
        <div className="text-center text-gray-400 pt-24 text-lg tracking-wide">COMING SOON</div>
      </main>
    </PageContainer>
  );
}
