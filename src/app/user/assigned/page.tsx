"use client";
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';

// Landing page for Assigned categories (Vehicles, Drivers, Conductors)
export default function AssignedCategoriesPage() {
  const router = useRouter();
  const { data: vehiclesData } = useVehicles();
  const { data: crewsData } = useCrews();

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Assigned vehicles have at least one crew member
  const assignedVehiclesCount = useMemo(() => {
    return vehicles.filter(v => v.crew && v.crew.length > 0).length;
  }, [vehicles]);

  // Crews with a vehicle are assigned
  const assignedCrews = useMemo(() => crews.filter(c => c.vehicle_id), [crews]);

  const assignedDriversCount = useMemo(() => {
    return assignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER').length;
  }, [assignedCrews]);

  const assignedConductorsCount = useMemo(() => {
    return assignedCrews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR').length;
  }, [assignedCrews]);

  const categories = [
    { title: 'Vehicles', count: assignedVehiclesCount, route: '/user/assigned/vehicles' },
    { title: 'Drivers', count: assignedDriversCount, route: '/user/assigned/drivers' },
    { title: 'Conductors', count: assignedConductorsCount, route: '/user/assigned/conductors' },
  ];

  return (
    <PageContainer>
      <PageHeader title="Assigned" backHref="/user" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(category => (
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
              className="cursor-pointer rounded-2xl border-gray-200 hover:shadow-lg transition-shadow bg-white"
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
