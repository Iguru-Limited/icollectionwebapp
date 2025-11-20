'use client';
"use client";
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { TopNavigation } from '@/components/ui/top-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { PageHeader, PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { TruckIcon } from '@heroicons/react/24/outline';

export default function VehiclesCategoriesPage() {
  const router = useRouter();
  const { data, isLoading } = useVehicles();
  const items = data?.data || [];
  // Group by type_name and count
  const grouped = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(v => { map[v.type_name] = (map[v.type_name] || 0) + 1; });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <PageContainer>
      <PageHeader title="Vehicles" />
      <main className="px-4 pb-24 max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {isLoading && (
            <Card className="p-6 space-y-2">
              {[...Array(3)].map((_,i)=>(<div key={i} className="h-12 bg-gray-100 animate-pulse rounded-full" />))}
            </Card>
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
                className="cursor-pointer rounded-full border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4 px-6 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-lg">{`${type} (${count})`}</span>
                  <TruckIcon className="w-5 h-5 text-purple-700" />
                </CardContent>
              </Card>
            );
          })}
          {/* Search card */}
          <Card
            role="button"
            tabIndex={0}
            onClick={() => router.push('/user/vehicles/search')}
            onKeyDown={(e) => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); router.push('/user/vehicles/search'); } }}
            className="cursor-pointer rounded-full border-dashed border-gray-300 hover:border-gray-400 hover:shadow-sm transition"
          >
            <CardContent className="py-4 px-6 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-lg">Search</span>
              <Button variant="outline" size="sm">Open</Button>
            </CardContent>
          </Card>
          {!isLoading && grouped.length === 0 && (
            <div className="text-center text-gray-500 py-12">No vehicles available.</div>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
