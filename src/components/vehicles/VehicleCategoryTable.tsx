"use client";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog, AssignCrewDialog } from '@/components/assign';
import { toast } from 'sonner';
import type { VehicleItem } from '@/types/vehicle';

interface VehicleCategoryTableProps {
  vehicles: VehicleItem[];
  isLoading?: boolean;
}

// Helper to extract first matching crew member by role id or role name heuristic
function findCrew(crew: VehicleItem['crew'], roleIds: string[], roleNames: string[]): string | null {
  const match = crew.find(c => roleIds.includes(c.crew_role_id) || roleNames.some(r => r === c.crew_role_id));
  return match?.name || null;
}

function getDriverName(crew: VehicleItem['crew']): string | null {
  // Known driver role_id examples: '3'
  return findCrew(crew, ['3'], ['DRIVER']);
}

function getConductorName(crew: VehicleItem['crew']): string | null {
  // Known conductor role_id examples: '12'
  return findCrew(crew, ['12'], ['CONDUCTOR']);
}

export function VehicleCategoryTable({ vehicles, isLoading }: VehicleCategoryTableProps) {
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; vehicleId: string; vehiclePlate: string; role: 'driver' | 'conductor' | null }>({
    open: false,
    vehicleId: '',
    vehiclePlate: '',
    role: null,
  });
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({ open: false, error: '', message: '', pendingIds: [] });
  
  const { data: crewsData } = useCrews();
  const crews = crewsData?.data || [];
  
  // Filter crews by role for the assignment dialog
  const roleFilteredCrews = assignDialog.role === 'driver' 
    ? crews.filter(c => (c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER') && c.active === '1')
    : assignDialog.role === 'conductor'
    ? crews.filter(c => (c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR') && c.active === '1')
    : [];

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      handleDialogClose();
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to confirm assignment');
    },
  });

  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Pending assignment request(s) cancelled successfully');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel assignment');
    },
  });

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      console.log('Assignment response:', data);
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictDialog({
          open: true,
          error: data.error || '',
          message: data.message || '',
          pendingIds: data.pending_assignment_ids,
        });
      } else {
        toast.success(`${assignDialog.role === 'driver' ? 'Driver' : 'Conductor'} assigned successfully`);
        handleDialogClose();
        window.location.reload();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign crew');
    },
  });

  const handleAssign = () => {
    if (!selectedCrewId || !assignDialog.vehicleId) {
      toast.error('Please select a crew member');
      return;
    }
    assignMutation.mutate({
      crew_id: Number(selectedCrewId),
      vehicle_id: Number(assignDialog.vehicleId),
    });
  };

  const handleDialogClose = () => {
    setAssignDialog({ open: false, vehicleId: '', vehiclePlate: '', role: null });
    setSelectedCrewId('');
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
        ))}
      </Card>
    );
  }

  if (vehicles.length === 0) {
    return <Card className="p-8 text-center text-gray-500">No vehicles found</Card>;
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {vehicles.map((v) => {
          const driver = v.crew?.find(c => c.crew_role_id === '3');
          const conductor = v.crew?.find(c => c.crew_role_id === '12');
          const hasCrew = driver || conductor;
          
          return (
            <Card key={v.vehicle_id} className="p-4">
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Vehicle Icon */}
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="text-lg font-bold uppercase">{v.number_plate}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{v.type_name}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tag Badge - if available */}
                {/* {v.vehicle_id && (
                  <div className="bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium">
                    F-{v.vehicle_id}
                  </div>
                )} */}
              </div>

              {hasCrew ? (
                <>
                  {/* Conductor - Only show if exists */}
                  {conductor && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 bg-red-100">
                          <AvatarFallback className="bg-red-100 text-red-700 text-sm">
                            {conductor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">COND.</div>
                          <div className="font-medium text-sm">{conductor.name}</div>
                        </div>
                        <button
                          onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'conductor' })}
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label="Reassign conductor"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Driver - Only show if exists */}
                  {driver && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
                            {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">DRIVER</div>
                          <div className="font-medium text-sm">{driver.name}</div>
                        </div>
                        <button
                          onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'driver' })}
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label="Reassign driver"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reassign Button */}
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'driver' })}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reassign
                  </Button>
                </>
              ) : (
                <>
                  {/* No Crew Warning */}
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800">No crew assigned</span>
                  </div>

                  {/* Assign Button */}
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'driver' })}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Assign
                  </Button>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <Card className="overflow-x-auto rounded-2xl hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Conductor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v, idx) => {
              const driver = getDriverName(v.crew) || '-';
              const conductor = getConductorName(v.crew) || '-';
              return (
                <TableRow key={v.vehicle_id} className="hover:bg-gray-50">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium uppercase">{v.number_plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{driver}</span>
                      <button
                        onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'driver' })}
                        className="text-purple-600 hover:text-purple-800"
                        aria-label="Assign driver"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{conductor}</span>
                      <button
                        onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'conductor' })}
                        className="text-purple-600 hover:text-purple-800"
                        aria-label="Assign conductor"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Assignment Dialog */}
      {assignDialog.role && (
        <AssignCrewDialog
          open={assignDialog.open}
          onOpenChange={(open) => !open && handleDialogClose()}
          crews={roleFilteredCrews}
          selectedCrewId={selectedCrewId}
          onCrewChange={setSelectedCrewId}
          onConfirm={handleAssign}
          title={`Assign ${assignDialog.role === 'driver' ? 'Driver' : 'Conductor'} to ${assignDialog.vehiclePlate}`}
          description={`Select a ${assignDialog.role} for this vehicle`}
          placeholder={`Search ${assignDialog.role} by name or badge...`}
          loading={assignMutation.isPending}
        />
      )}

      <AssignmentConflictDialog
        open={conflictDialog.open}
        errorMessage={conflictDialog.error}
        message={conflictDialog.message}
        onConfirm={() => {
          const pendingIds = conflictDialog.pendingIds.map(id => Number(id));
          confirmMutation.mutate({ assignment_ids: pendingIds });
        }}
        onCancel={() => {
          const pendingIds = conflictDialog.pendingIds.map(id => Number(id));
          cancelMutation.mutate({ assignment_ids: pendingIds });
        }}
        isLoading={confirmMutation.isPending || cancelMutation.isPending}
      />
    </>
  );
}