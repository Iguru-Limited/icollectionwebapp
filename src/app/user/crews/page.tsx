"use client";
import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageContainer, PageHeader, SearchBar, FloatingActionButton } from '@/components/layout';
import { CrewList, CrewTabs, type CrewTab } from '@/components/crews';
import { useCrews } from '@/hooks/crew';

export default function CrewsListPage() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState<CrewTab>('All');
  
  const { data: crewsResponse, isLoading, error } = useCrews();
  const crews = crewsResponse?.data ?? [];

  const filtered = useMemo(() => {
    return crews.filter(c =>
      (active === 'All' || c.role_name?.toUpperCase() === active) &&
      (c.name?.toLowerCase().includes(q.toLowerCase()) || 
       c.badge_number?.toLowerCase().includes(q.toLowerCase()) ||
       c.phone?.toLowerCase().includes(q.toLowerCase())),
    );
  }, [crews, q, active]);

  return (
    <PageContainer>
      <PageHeader title="Crew List" />

      <main className="px-4 pb-24 max-w-4xl mx-auto">
        <SearchBar 
          value={q} 
          onChange={setQ} 
          placeholder="Search by Name, Badge No, or Phone..." 
        />

        <CrewTabs activeTab={active} onTabChange={setActive} />

        {error ? (
          <div className="text-center text-red-600 py-8">
            Error loading crews: {error.message}
          </div>
        ) : (
          <CrewList crews={filtered} isLoading={isLoading} />
        )}

        <FloatingActionButton href="/user/crews/add" icon={UserPlus} label="Add crew" />
      </main>
    </PageContainer>
  );
}
