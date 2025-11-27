"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { AssignmentConflictDialog } from '@/components/assign';
import { AssignCrewSheet } from '@/components/vehicles/AssignCrewSheet';
import { useMemo, useState } from 'react';
import type { AssignVehicleResponse } from '@/types/crew';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { MagnifyingGlassIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function PendingVehiclesPage() {
  const { data: vehiclesData, isLoading } = useVehicles();
  const { data: crewsData } = useCrews();

  const [assignSheet, setAssignSheet] = useState<{ open: boolean; vehicleId: string; vehiclePlate: string; typeName: string }>({
    open: false,
    vehicleId: '',
    vehiclePlate: '',
    typeName: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter unassigned vehicles (vehicles with no crew members)
  const unassignedVehicles = useMemo(() => {
    return vehicles.filter(v => !v.crew || v.crew.length === 0);
  }, [vehicles]);

  // Filter by search query
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return unassignedVehicles;
    const query = searchQuery.toLowerCase();
    return unassignedVehicles.filter(v => 
      v.number_plate?.toLowerCase().includes(query) ||
      v.type_name?.toLowerCase().includes(query)
    );
  }, [unassignedVehicles, searchQuery]);

  // Count assigned vehicles
  const assignedCount = useMemo(() => {
    return vehicles.filter(v => v.crew && v.crew.length > 0).length;
  }, [vehicles]);

  // Filter crews by role
  const conductors = useMemo(() => crews.filter(c => (c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR') && c.active === '1'), [crews]);
  const drivers = useMemo(() => crews.filter(c => (c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER') && c.active === '1'), [crews]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      console.log('Assignment response:', data);
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({
          open: true,
          error: data.error || '',
          message: data.message || '',
          pendingIds: data.pending_assignment_ids,
        });
      } else {
        toast.success('Crew assigned successfully');
        setAssignSheet({ open: false, vehicleId: '', vehiclePlate: '', typeName: '' });
        window.location.reload();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign crew');
    },
  });

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
      setAssignSheet({ open: false, vehicleId: '', vehiclePlate: '', typeName: '' });
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to confirm assignment');
    }
  });
  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Pending assignment request(s) cancelled successfully');
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel assignment');
    }
  });

  const handleAssignCrew = (crewId: string, role: 'conductor' | 'driver') => {
    if (!crewId || !assignSheet.vehicleId) {
      toast.error('Please select a crew member');
      return;
    }
    assignMutation.mutate({
      crew_id: Number(crewId),
      vehicle_id: Number(assignSheet.vehicleId),
    });
  };

  const handleSheetClose = () => {
    setAssignSheet({ open: false, vehicleId: '', vehiclePlate: '', typeName: '' });
  };

  return (
    <PageContainer>
      <PageHeader title="Pending Vehicles" backHref="/user" />
      <main className="px-4 pb-24 max-w-4xl mx-auto space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Header with counts */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">{assignedCount} active </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by plate number, fleet, or investor."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <TruckIcon className="w-5 h-5" />
                  <span className="font-bold text-lg">{vehicles.length}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </Card>
              <Card className="p-4 rounded-xl bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-bold text-lg">{assignedCount}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Assigned</p>
              </Card>
              <Card className="p-4 rounded-xl bg-yellow-50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="font-bold text-lg">{unassignedVehicles.length}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Unassigned</p>
              </Card>
            </div>

            {/* Vehicles Count Header */}
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              {filteredVehicles.length} VEHICLES
            </div>

            {/* Vehicle List */}
            <div className="space-y-3">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.vehicle_id} className="p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    {/* Left side - Vehicle info */}
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center">
                        <TruckIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{vehicle.number_plate}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs text-gray-500 uppercase">{vehicle.type_name || 'BUS'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Badge and Button */}
                    <div className="flex flex-col items-end gap-2">
                      {/* <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 rounded-md px-2 py-0.5 text-xs font-semibold">
                        F-{vehicle.vehicle_id}
                      </Badge> */}
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6"
                        onClick={() => {
                          setAssignSheet({
                            open: true,
                            vehicleId: vehicle.vehicle_id,
                            vehiclePlate: vehicle.number_plate,
                            typeName: vehicle.type_name || 'BUS',
                          });
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Assign
                      </Button>
                    </div>
                  </div>

                  {/* No crew assigned warning */}
                  <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs font-medium text-yellow-800">No crew assigned</span>
                  </div>
                </Card>
              ))}

              {filteredVehicles.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  {searchQuery ? 'No vehicles match your search' : 'No pending vehicles found'}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Assignment Sheet */}
      <AssignCrewSheet
        open={assignSheet.open}
        onOpenChange={(open) => !open && handleSheetClose()}
        vehicle={{
          number_plate: assignSheet.vehiclePlate,
          type_name: assignSheet.typeName,
          vehicle_id: assignSheet.vehicleId,
        }}
        conductors={conductors}
        drivers={drivers}
        onAssign={handleAssignCrew}
        loading={assignMutation.isPending}
      />

      {/* Conflict Dialog */}
      <AssignmentConflictDialog
        open={conflictState.open}
        errorMessage={conflictState.error}
        message={conflictState.message}
        onConfirm={() => {
          // Confirm overwrite
          const ids = conflictState.pendingIds.map(id => Number(id));
          confirmMutation.mutate({ assignment_ids: ids });
        }}
        onCancel={() => {
          const ids = conflictState.pendingIds.map(id => Number(id));
          cancelMutation.mutate({ assignment_ids: ids });
        }}
        isLoading={confirmMutation.isPending || cancelMutation.isPending}
      />
    </PageContainer>
  );
}
