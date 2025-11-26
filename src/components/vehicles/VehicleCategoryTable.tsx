"use client";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
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
      <Card className="overflow-x-auto rounded-2xl">
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