"use client";
import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageContainer, PageHeader, SearchBar, FloatingActionButton } from '@/components/layout';
import { CrewList, CrewTabs, type Crew, type CrewTab } from '@/components/crews';

export default function CrewsListPage() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState<CrewTab>('All');
  const [crews, setCrews] = useState<Crew[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/crews');
      const json = await res.json();
      setCrews(json.data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    return crews.filter(c =>
      (active === 'All' || c.role?.toLowerCase() === active.toLowerCase().slice(0, -1)) &&
      (c.name?.toLowerCase().includes(q.toLowerCase()) || c.badgeNo?.toLowerCase().includes(q.toLowerCase())),
    );
  }, [crews, q, active]);

  return (
    <PageContainer>
      <PageHeader title="Crew List" />

      <main className="px-4 pb-24 max-w-sm mx-auto">
        <SearchBar 
          value={q} 
          onChange={setQ} 
          placeholder="Search by Name or Badge No..." 
        />

        <CrewTabs activeTab={active} onTabChange={setActive} />

        <CrewList crews={filtered} />

        <FloatingActionButton href="/user/crews/add" icon={UserPlus} label="Add crew" />
      </main>
    </PageContainer>
  );
}
