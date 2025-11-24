"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import type { Crew } from '@/types/crew';

type FilterType = 'vehicles' | 'drivers' | 'conductors' | null;

export default function AssignedPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { data: crewsData, isLoading: crewsLoading } = useCrews();

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter assigned vehicles (vehicles with at least one crew member)
  const assignedVehicles = useMemo(() => {
    return vehicles.filter(v => v.crew && v.crew.length > 0);
  }, [vehicles]);

  // Filter assigned crews (crews with a vehicle)
  const assignedCrews = useMemo(() => {
    return crews.filter(c => c.vehicle_id && c.vehicle_plate);
  }, [crews]);

  const assignedDrivers = useMemo(() => {
    return assignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  }, [assignedCrews]);

  const assignedConductors = useMemo(() => {
    return assignedCrews.filter((c: Crew) => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');
  }, [assignedCrews]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';
  };

  const getBadgeExpiryDisplay = (badgeExpiry: string | null) => {
    if (!badgeExpiry) return { text: '-', className: '' };
    
    const expiryDate = new Date(badgeExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        text: `Expired ${daysAgo}d ago`,
        className: 'text-red-600 font-semibold'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Expires today',
        className: 'text-red-600 font-semibold'
      };
    } else {
      return {
        text: `${diffDays}d left`,
        className: ''
      };
    }
  };

  const isLoading = vehiclesLoading || crewsLoading;

  return (
    <PageContainer>
      <PageHeader title="Assigned" backHref="/user" />
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
                <div className="rounded-2xl shadow-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50 hover:bg-purple-50">
                        <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">#</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl">Number Plate</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden sm:table-cell">Type</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden md:table-cell">Driver</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-xl md:text-2xl hidden md:table-cell">Conductor</TableHead>
                        <TableHead className="font-semibold text-purple-900 text-right text-xl md:text-2xl">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedVehicles.map((vehicle, index) => {
                        const driver = vehicle.crew?.find(c => c.crew_role_id === '3');
                        const conductor = vehicle.crew?.find(c => c.crew_role_id === '12');
                        return (
                          <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                            <TableCell className="font-large text-gray-600 text-xl md:text-2xl">{index + 1}</TableCell>
                            <TableCell className="font-bold text-xl md:text-2xl text-gray-800 uppercase">{vehicle.number_plate}</TableCell>
                            <TableCell className="text-xl md:text-2xl text-gray-700 hidden sm:table-cell">{vehicle.type_name || '-'}</TableCell>
                            <TableCell className="text-sm hidden md:table-cell">{driver?.name || '-'}</TableCell>
                            <TableCell className="text-sm hidden md:table-cell">{conductor?.name || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-base md:text-2xl"
                                onClick={() => router.push('/user/vehicles/search')}
                              >
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {assignedVehicles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No assigned vehicles found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeFilter === 'drivers' && (
                <div className="rounded-lg border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Badge No.</TableHead>
                        <TableHead>Badge Expiry</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedDrivers.map((driver) => (
                        <TableRow
                          key={driver.crew_id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/user/crews/${driver.crew_id}`)}
                        >
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {getInitials(driver.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.role_name ? driver.role_name.charAt(0) + driver.role_name.slice(1).toLowerCase() : '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{driver.badge_number || '-'}</TableCell>
                          <TableCell className="text-sm">
                            <span className={getBadgeExpiryDisplay(driver.badge_expiry).className}>
                              {getBadgeExpiryDisplay(driver.badge_expiry).text}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{driver.vehicle_plate}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/user/crews/${driver.crew_id}`);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {assignedDrivers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            No assigned drivers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeFilter === 'conductors' && (
                <div className="rounded-lg border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Badge No.</TableHead>
                        <TableHead>Badge Expiry</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedConductors.map((conductor) => (
                        <TableRow
                          key={conductor.crew_id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/user/crews/${conductor.crew_id}`)}
                        >
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {getInitials(conductor.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{conductor.name}</TableCell>
                          <TableCell>{conductor.role_name ? conductor.role_name.charAt(0) + conductor.role_name.slice(1).toLowerCase() : '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{conductor.badge_number || '-'}</TableCell>
                          <TableCell className="text-sm">
                            <span className={getBadgeExpiryDisplay(conductor.badge_expiry).className}>
                              {getBadgeExpiryDisplay(conductor.badge_expiry).text}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{conductor.vehicle_plate}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/user/crews/${conductor.crew_id}`);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {assignedConductors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            No assigned conductors found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>            
          </div>
        )}
      </main>
    </PageContainer>
  );
}
