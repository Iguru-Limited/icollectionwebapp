"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

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
          <div className="rounded-2xl shadow-md overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">#</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Vehicle</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Driver</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Conductor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                    <TableCell className="font-large text-gray-600 text-xl md:text-2xl">{index + 1}</TableCell>
                    <TableCell className="font-bold text-xl md:text-2xl text-gray-800 uppercase">{vehicle.number_plate}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => router.push('/user/vehicles/search')}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800"
                      >
                        - <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => router.push('/user/vehicles/search')}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800"
                      >
                        - <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
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
