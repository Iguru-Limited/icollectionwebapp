"use client";
import { useSession } from 'next-auth/react';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { UserIcon, UsersIcon } from '@heroicons/react/24/solid';

// Categories landing page showing counts per crew role from session.stats
export default function CrewCategoriesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: crewsData } = useCrews();
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);
  const assignedCount = useMemo(() => crews.filter(c => c.vehicle_id).length, [crews]);
  const pendingCount = useMemo(() => crews.filter(c => !c.vehicle_id).length, [crews]);

  const roleStats = session?.stats?.crew?.roles || [];

  const toPlural = (roleName: string) => {
    const proper = roleName.charAt(0) + roleName.slice(1).toLowerCase();
    // Simple plural: add s if count != 1
    return proper + 's';
  };

  return (
    <PageContainer>
      <PageHeader title="Crew" backHref="/user" />
      <main className="px-4 pb-24">
        {/* Header with total */}
        <div className="bg-purple-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="bg-purple-700 rounded-full p-3">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Crew Management</h2>
            <p className="text-sm text-gray-600">{session?.stats?.crew?.total_crew || 0} total</p>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {roleStats.map((r) => {
            const count = parseInt(String(r.count), 10) || 0;
            const slug = r.role_name.toLowerCase();
            return (
              <Card
                key={r.crew_role_id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/user/crews/roles/${slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/user/crews/roles/${slug}`);
                  }
                }}
                className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 flex flex-col items-start gap-3">
                  <div className="bg-purple-700 rounded-full p-3 mb-1">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{toPlural(r.role_name)}</div>
                </CardContent>
              </Card>
            );
          })}
          {roleStats.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-12">No crew role statistics available.</div>
          )}
        </div>

        {/* Assignment Status */}
        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Assignment Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => router.push('/user/crews/assigned')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/user/crews/assigned'); } }}
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex items-center gap-3">
                <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{assignedCount}</div>
                  <div className="text-xs text-gray-600">Assigned</div>
                </div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => router.push('/user/crews/pending')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/user/crews/pending'); } }}
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex items-center gap-3">
                <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{pendingCount}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
