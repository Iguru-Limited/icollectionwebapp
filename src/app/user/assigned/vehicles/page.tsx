"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface CrewMember { crew_role_id: string; name?: string }
interface Vehicle { vehicle_id: string | number; number_plate: string; type_name?: string; crew?: CrewMember[] }

export default function AssignedVehiclesPage() {
  const router = useRouter();
  const { data: vehiclesData, isLoading } = useVehicles();
  const vehicles: Vehicle[] = useMemo(() => (vehiclesData?.data || []) as Vehicle[], [vehiclesData?.data]);

  // Assigned vehicles have at least one crew member
  const assignedVehicles: Vehicle[] = useMemo(() => vehicles.filter((v: Vehicle) => v.crew && v.crew.length > 0), [vehicles]);

  return (
    <PageContainer>
      <PageHeader title="Assigned Vehicles" backHref="/user/assigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
        )}
        {!isLoading && (
          <div className="rounded-2xl shadow-md overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">#</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Number Plate</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden sm:table-cell">Type</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden md:table-cell">Driver</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden md:table-cell">Conductor</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right text-xl md:text-2xl">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedVehicles.map((vehicle: Vehicle, index: number) => {
                  const driver = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '3');
                  const conductor = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '12');
                  return (
                    <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                      <TableCell className="font-large text-gray-600 text-xl md:text-2xl">{index + 1}</TableCell>
                      <TableCell className="font-bold text-xl md:text-2xl text-gray-800 uppercase">{vehicle.number_plate}</TableCell>
                      <TableCell className="text-xl md:text-2xl text-gray-700 hidden sm:table-cell">{vehicle.type_name || '-'}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{driver?.name || '-'}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{conductor?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-base md:text-2xl" onClick={() => router.push('/user/vehicles/search')}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {assignedVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">No assigned vehicles found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
