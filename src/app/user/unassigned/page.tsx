"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

type FilterType = 'vehicles' | 'drivers' | 'conductors' | null;

export default function UnassignedPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { data: crewsData, isLoading: crewsLoading } = useCrews();

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter unassigned vehicles (vehicles with no crew members)
  const unassignedVehicles = useMemo(() => {
    return vehicles.filter(v => !v.crew || v.crew.length === 0);
  }, [vehicles]);

  // Filter unassigned crews (crews without a vehicle)
  const unassignedCrews = useMemo(() => {
    return crews.filter(c => !c.vehicle_id);
  }, [crews]);

  const unassignedDrivers = useMemo(() => {
    return unassignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  }, [unassignedCrews]);

  const unassignedConductors = useMemo(() => {
    return unassignedCrews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');
  }, [unassignedCrews]);

  const isLoading = vehiclesLoading || crewsLoading;

  return (
    <PageContainer>
      <PageHeader title="Pending" backHref="/user" />
      <main className="px-4 pb-24 max-w-4xl mx-auto space-y-6">       

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            {/* Category Buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setActiveFilter('vehicles')}
                className={`px-6 py-2 rounded-full font-medium text-sm shadow-sm transition ${
                  activeFilter === 'vehicles'
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Vehicles
              </button>
              <button
                onClick={() => setActiveFilter('drivers')}
                className={`px-6 py-2 rounded-full font-medium text-sm shadow-sm transition ${
                  activeFilter === 'drivers'
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveFilter('conductors')}
                className={`px-6 py-2 rounded-full font-medium text-sm shadow-sm transition ${
                  activeFilter === 'conductors'
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Conductors
              </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {!activeFilter && (
                <div className="p-6 min-h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Select a category above to view details
                  </p>
                </div>
              )}

              {activeFilter === 'vehicles' && (
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
              )}

              {activeFilter === 'drivers' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Badge No.</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedDrivers.map((driver) => (
                      <TableRow key={driver.crew_id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Avatar className="w-10 h-10 bg-purple-100 text-purple-700 font-semibold">
                            {driver.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="text-sm font-mono">{driver.badge_number || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-purple-700 hover:bg-purple-800"
                            onClick={() => router.push(`/user/crews/${driver.crew_id}`)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {unassignedDrivers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No pending drivers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {activeFilter === 'conductors' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Badge No.</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedConductors.map((conductor) => (
                      <TableRow key={conductor.crew_id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Avatar className="w-10 h-10 bg-purple-100 text-purple-700 font-semibold">
                            {conductor.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{conductor.name}</TableCell>
                        <TableCell className="text-sm font-mono">{conductor.badge_number || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-purple-700 hover:bg-purple-800"
                            onClick={() => router.push(`/user/crews/${conductor.crew_id}`)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {unassignedConductors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No pending conductors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            
          </div>
        )}
      </main>
    </PageContainer>
  );
}
