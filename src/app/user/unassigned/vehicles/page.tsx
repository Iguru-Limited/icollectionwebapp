"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { AssignmentConflictDialog, AssignCrewDialog } from '@/components/assign';
import { useMemo, useState } from 'react';
import type { AssignVehicleResponse } from '@/types/crew';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function PendingVehiclesPage() {
  const { data: vehiclesData, isLoading } = useVehicles();
  const { data: crewsData } = useCrews();

  const [openAssign, setOpenAssign] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'driver' | 'conductor' | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter unassigned vehicles (vehicles with no crew members)
  const unassignedVehicles = useMemo(() => {
    return vehicles.filter(v => !v.crew || v.crew.length === 0);
  }, [vehicles]);

  // Show ALL drivers and conductors (whether assigned or not) for assignment
  const allDrivers = useMemo(() => crews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER'), [crews]);
  const allConductors = useMemo(() => crews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR'), [crews]);

  const crewListForDialog = useMemo(() => {
    return selectedRole === 'driver' ? allDrivers : allConductors;
  }, [selectedRole, allDrivers, allConductors]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data: AssignVehicleResponse) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({ open: true, error: data.error || 'Conflict detected', message: data.message || '', pendingIds: data.pending_assignment_ids });
      } else {
        toast.success(data.message || 'Crew assigned successfully');
        // Close dialog and reset
        setOpenAssign(false);
        setSelectedVehicleId(null);
        setSelectedRole(null);
        setSelectedCrewId('');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to assign crew');
      console.error('Assignment failed', err);
    }
  });

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment confirmed successfully');
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
      setOpenAssign(false);
      setSelectedCrewId('');
    },
    onError: (e) => {
      toast.error('Failed to confirm assignment');
      console.error(e);
    }
  });
  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment cancelled successfully');
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (e) => {
      toast.error('Failed to cancel assignment');
      console.error(e);
    }
  });

  const handleAssign = () => {
    if (selectedVehicleId == null || !selectedCrewId) return;
    assignMutation.mutate({ vehicle_id: Number(selectedVehicleId), crew_id: Number(selectedCrewId) });
  };

  const handleDialogClose = () => {
    setOpenAssign(false);
    setSelectedRole(null);
    setSelectedCrewId('');
  };

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
                        onClick={() => {
                          setSelectedVehicleId(vehicle.vehicle_id);
                          setSelectedRole('driver');
                          setOpenAssign(true);
                        }}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800"
                      >
                        - <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => {
                          setSelectedVehicleId(vehicle.vehicle_id);
                          setSelectedRole('conductor');
                          setOpenAssign(true);
                        }}
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

      {/* Assignment Dialog */}
      {selectedRole && (
        <AssignCrewDialog
          open={openAssign}
          onOpenChange={(open) => !open && handleDialogClose()}
          title={`Assign ${selectedRole === 'driver' ? 'Driver' : 'Conductor'}`}
          description={selectedVehicleId ? `Select a ${selectedRole} for this vehicle` : ''}
          crews={crewListForDialog}
          selectedCrewId={selectedCrewId}
          onCrewChange={setSelectedCrewId}
          onConfirm={handleAssign}
          loading={assignMutation.isPending}
          placeholder={`Search ${selectedRole} by name or badge...`}
        />
      )}
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
