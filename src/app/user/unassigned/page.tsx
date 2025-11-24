"use client";
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';

// Categories landing page showing counts for pending vehicles, drivers, conductors
export default function PendingCategoriesPage() {
  const router = useRouter();
  const { data: vehiclesData } = useVehicles();
  const { data: crewsData } = useCrews();

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Calculate pending counts
  const pendingVehiclesCount = useMemo(() => {
    return vehicles.filter(v => !v.crew || v.crew.length === 0).length;
  }, [vehicles]);

  const unassignedCrews = useMemo(() => {
    return crews.filter(c => !c.vehicle_id);
  }, [crews]);

  const pendingDriversCount = useMemo(() => {
    return unassignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER').length;
  }, [unassignedCrews]);

  const pendingConductorsCount = useMemo(() => {
    return unassignedCrews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR').length;
  }, [unassignedCrews]);

  const categories = [
    {
      title: 'Vehicles',
      count: pendingVehiclesCount,
      route: '/user/unassigned/vehicles',
    },
    {
      title: 'Drivers',
      count: pendingDriversCount,
      route: '/user/unassigned/drivers',
    },
    {
      title: 'Conductors',
      count: pendingConductorsCount,
      route: '/user/unassigned/conductors',
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="Pending" backHref="/user" />
      <main className="px-4 pb-24 max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => (
            <Card
              key={category.title}
              role="button"
              tabIndex={0}
              onClick={() => router.push(category.route)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(category.route);
                }
              }}
              className="cursor-pointer rounded-full border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="py-4 px-6 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-lg">{`${category.title} (${category.count})`}</span>
                <span className="text-sm text-gray-500">View</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </PageContainer>
  );
}
