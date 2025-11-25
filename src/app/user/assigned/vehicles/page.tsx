"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog, AssignCrewDialog } from '@/components/assign';
import { toast } from 'sonner';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface CrewMember { crew_id: string; crew_role_id: string; name?: string }
interface Vehicle { vehicle_id: string | number; number_plate: string; type_name?: string; crew?: CrewMember[] }

export default function AssignedVehiclesPage() {
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { data: crewsData } = useCrews();
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedRole, setSelectedRole] = useState<'driver' | 'conductor' | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const vehicles: Vehicle[] = useMemo(() => (vehiclesData?.data || []) as Vehicle[], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Assigned vehicles have at least one crew member
  const assignedVehicles: Vehicle[] = useMemo(() => vehicles.filter((v: Vehicle) => v.crew && v.crew.length > 0), [vehicles]);

  // Show ALL crews by role (whether assigned or not)
  const allDrivers = useMemo(() => crews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER'), [crews]);
  const allConductors = useMemo(() => crews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR'), [crews]);

  const crewListForDialog = useMemo(() => {
    return selectedRole === 'driver' ? allDrivers : allConductors;
  }, [selectedRole, allDrivers, allConductors]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({ open: true, error: data.error || 'Conflict detected', message: data.message || '', pendingIds: data.pending_assignment_ids });
      } else {
        toast.success(data.message || 'Crew assigned successfully');
        setOpenAssign(false);
        setSelectedVehicle(null);
        setSelectedRole(null);
        setSelectedCrewId('');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to assign crew');
      console.error(err);
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
    if (!selectedVehicle || !selectedCrewId) return;
    assignMutation.mutate({ vehicle_id: Number(selectedVehicle.vehicle_id), crew_id: Number(selectedCrewId) });
  };

  const handleDialogClose = () => {
    setOpenAssign(false);
    setSelectedRole(null);
    setSelectedCrewId('');
  };

  return (
    <PageContainer>
      <PageHeader title="Assigned Vehicles" backHref="/user/assigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {vehiclesLoading && (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
        )}
        {!vehiclesLoading && (
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
                {assignedVehicles.map((vehicle: Vehicle, index: number) => {
                  const driver = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '3');
                  const conductor = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '12');
                  return (
                    <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                      <TableCell className="font-large text-gray-600 text-xl md:text-2xl">{index + 1}</TableCell>
                      <TableCell className="font-bold text-xl md:text-2xl text-gray-800 uppercase">{vehicle.number_plate}</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setSelectedRole('driver');
                            setOpenAssign(true);
                          }}
                          className="inline-flex items-center gap-1 hover:text-purple-800"
                        >
                          <span className={driver ? 'text-gray-900' : 'text-purple-600'}>{driver ? driver.name : '-'}</span>
                          <PencilSquareIcon className="w-5 h-5 text-purple-600" />
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setSelectedRole('conductor');
                            setOpenAssign(true);
                          }}
                          className="inline-flex items-center gap-1 hover:text-purple-800"
                        >
                          <span className={conductor ? 'text-gray-900' : 'text-purple-600'}>{conductor ? conductor.name : '-'}</span>
                          <PencilSquareIcon className="w-5 h-5 text-purple-600" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {assignedVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">No assigned vehicles found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      {/* Assignment Dialog */}
      <AssignCrewDialog
        open={openAssign}
        onOpenChange={handleDialogClose}
        title={`Assign ${selectedRole === 'driver' ? 'Driver' : 'Conductor'}`}
        description={`Vehicle: ${selectedVehicle?.number_plate || ''}`}
        crews={crewListForDialog}
        selectedCrewId={selectedCrewId}
        onCrewChange={setSelectedCrewId}
        onConfirm={handleAssign}
        loading={assignMutation.isPending}
      />
      <AssignmentConflictDialog
        open={conflictState.open}
        errorMessage={conflictState.error}
        message={conflictState.message}
        onConfirm={() => {
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
