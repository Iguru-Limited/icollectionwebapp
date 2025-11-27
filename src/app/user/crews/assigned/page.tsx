"use client";
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';

export default function CrewAssignedCategoriesPage() {
  const router = useRouter();
  const { data: crewsData } = useCrews();
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  const assignedCrews = useMemo(() => crews.filter(c => c.vehicle_id), [crews]);
  const driversCount = useMemo(() => assignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER').length, [assignedCrews]);
  const conductorsCount = useMemo(() => assignedCrews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR').length, [assignedCrews]);

  const categories = [
    { title: 'Drivers', count: driversCount, route: '/user/crews/assigned/drivers' },
    { title: 'Conductors', count: conductorsCount, route: '/user/crews/assigned/conductors' },
  ];

  return (
    <PageContainer>
      <PageHeader title="Assigned" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {categories.map(category => (
            <Card
              key={category.title}
              role="button"
              tabIndex={0}
              onClick={() => router.push(category.route)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(category.route); } }}
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="py-6 px-6 flex flex-col items-center justify-center text-center">
                <span className="font-bold text-gray-800 text-2xl mb-2">{category.count}</span>
                <span className="text-sm text-gray-600">{category.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </PageContainer>
  );
}
