'use client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { PageHeader, PageContainer } from '@/components/layout';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TruckIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

export default function VehiclesCategoriesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading } = useVehicles();
  const items = useMemo(() => data?.data || [], [data?.data]);
  // Group by type_name and count
  const grouped = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(v => { map[v.type_name] = (map[v.type_name] || 0) + 1; });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <PageContainer>
      <PageHeader title="Vehicles" backHref="/user"/>
      <main className="px-4 pb-24">
        {/* Header with total */}
        <div className="bg-purple-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="bg-purple-700 rounded-full p-3">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Management</h2>
            <p className="text-sm text-gray-600">{session?.stats?.vehicles?.total_vehicles || 0} total</p>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {isLoading && (
            [...Array(2)].map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="bg-gray-200 rounded-full w-12 h-12 mb-3 animate-pulse" />
                  <div className="bg-gray-200 h-8 w-16 mb-2 rounded animate-pulse" />
                  <div className="bg-gray-200 h-4 w-20 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          )}
          {!isLoading && grouped.map(([type, count]) => {
            const slug = type.toLowerCase();
            return (
              <Card
                key={type}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/user/vehicles/types/${slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/user/vehicles/types/${slug}`);
                  }
                }}
                className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 flex flex-col items-start gap-3">
                  <div className="bg-purple-700 rounded-full p-3 mb-1">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{type}</div>
                </CardContent>
              </Card>
            );
          })}
          {!isLoading && grouped.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-12">No vehicles available.</div>
          )}
        </div>

        {/* Assignment Status */}
        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Assignment Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => router.push('/user/vehicles/assigned')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push('/user/vehicles/assigned');
                }
              }}
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{session?.stats?.vehicles?.assignment?.assigned ?? 0}</div>
                    <div className="text-xs text-gray-600">Assigned</div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Active assignments</div>
              </CardContent>
            </Card>

            <Card
              role="button"
              tabIndex={0}
              onClick={() => router.push('/user/vehicles/unassigned')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push('/user/vehicles/unassigned');
                }
              }}
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{session?.stats?.vehicles?.assignment?.unassigned ?? 0}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Awaiting assignment</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
