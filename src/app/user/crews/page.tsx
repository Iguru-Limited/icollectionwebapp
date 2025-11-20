"use client";
import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageContainer, PageHeader, SearchBar, FloatingActionButton } from '@/components/layout';
import { CrewList, CrewTabs } from '@/components/crews';
import { useCrews, useCrewRoles } from '@/hooks/crew';

export default function CrewsListPage() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string>('All');
  
  const { data: crewsResponse, isLoading, error } = useCrews();
  const { data: rolesResponse, isLoading: rolesLoading } = useCrewRoles();
  const roles = rolesResponse?.data ?? [];

  const allCount = crewsResponse?.data?.length ?? 0;
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (crewsResponse?.data ?? []).forEach((c) => {
      const key = c.role_name || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [crewsResponse?.data]);

  const filtered = useMemo(() => {
    const crews = crewsResponse?.data ?? [];
    return crews.filter(c =>
      (active === 'All' || c.role_name?.toUpperCase() === active.toUpperCase()) &&
      (c.name?.toLowerCase().includes(q.toLowerCase()) || 
       c.badge_number?.toLowerCase().includes(q.toLowerCase()) ||
       c.phone?.toLowerCase().includes(q.toLowerCase())),
    );
  }, [crewsResponse?.data, q, active]);

  return (
    <PageContainer>
      <PageHeader title="Crew List" />

      <main className="px-4 pb-24 max-w-4xl mx-auto">
        <SearchBar 
          value={q} 
          onChange={setQ} 
          placeholder="Search by Name, Badge No, or Phone..." 
        />

        <CrewTabs 
          activeTab={active} 
          onTabChange={setActive} 
          roles={roles}
          isLoading={rolesLoading}
          roleCounts={roleCounts}
          allCount={allCount}
        />

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
