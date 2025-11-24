"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function PendingVehiclesPage() {
  const router = useRouter();
  const { data: vehiclesData, isLoading } = useVehicles();

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);

  // Filter unassigned vehicles (vehicles with no crew members)
  const unassignedVehicles = useMemo(() => {
    return vehicles.filter(v => !v.crew || v.crew.length === 0);
  }, [vehicles]);

  return (
    <PageContainer>
      <PageHeader title="Pending Vehicles" backHref="/user/unassigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.vehicle_id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-semibold uppercase">{vehicle.number_plate}</TableCell>
                    <TableCell className="text-sm text-gray-600">{vehicle.type_name || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-purple-700 hover:bg-purple-800"
                        onClick={() => router.push('/user/vehicles/search')}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      No pending vehicles found
                    </TableCell>
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
