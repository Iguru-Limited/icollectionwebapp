"use client";
import { useParams, useRouter } from 'next/navigation';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useCrews } from '@/hooks/crew';
import { CrewList } from '@/components/crews';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';

export default function CrewRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleParam = (params?.role as string)?.toUpperCase(); // e.g. CONDUCTOR
  const singular = roleParam?.charAt(0) + roleParam?.slice(1).toLowerCase();
  const pluralLabel = singular + 's';
  const [q, setQ] = useState('');

  const { data: crewsResponse, isLoading, error } = useCrews();
  const filtered = useMemo(() => {
    const crews = crewsResponse?.data || [];
    return crews.filter(c =>
      c.role_name?.toUpperCase() === roleParam &&
      (c.name?.toLowerCase().includes(q.toLowerCase()) ||
       c.badge_number?.toLowerCase().includes(q.toLowerCase()) ||
       c.phone?.toLowerCase().includes(q.toLowerCase()))
    );
  }, [crewsResponse?.data, roleParam, q]);

  return (
    <PageContainer>
      <PageHeader title={pluralLabel} />
      <main className="px-4 pb-24 max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => router.push('/user/crews')}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Categories
        </button>

        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={`Search ${pluralLabel} by Name, Badge No, or Phone...`}
        />

        {error ? (
          <div className="text-center text-red-600 py-8">Error loading crews: {error.message}</div>
        ) : (
          <CrewList crews={filtered} isLoading={isLoading} />
        )}
      </main>
    </PageContainer>
  );
}
