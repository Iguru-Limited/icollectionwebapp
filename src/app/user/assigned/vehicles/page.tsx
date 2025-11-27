"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useUnassignCrew } from '@/hooks/crew/useUnassignCrew';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog, AssignCrewDialog } from '@/components/assign';
import { RemoveCrewDialog } from '@/components/vehicles/RemoveCrewDialog';
import { toast } from 'sonner';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; crewName: string; crewId: string; role: 'conductor' | 'driver'; vehiclePlate: string }>({ open: false, crewName: '', crewId: '', role: 'conductor', vehiclePlate: '' });

  const vehicles: Vehicle[] = useMemo(() => (vehiclesData?.data || []) as Vehicle[], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Assigned vehicles have at least one crew member
  const assignedVehicles: Vehicle[] = useMemo(() => vehicles.filter((v: Vehicle) => v.crew && v.crew.length > 0), [vehicles]);

  // Show ALL crews by role (whether assigned or not)
  const allDrivers = useMemo(() => crews.filter(c => (c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER') && c.active === '1'), [crews]);
  const allConductors = useMemo(() => crews.filter(c => (c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR') && c.active === '1'), [crews]);

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

  const unassignMutation = useUnassignCrew({
    onSuccess: (data) => {
      toast.success(data.message || 'Crew removed successfully');
      setRemoveDialog({ ...removeDialog, open: false });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove crew');
    }
  });

  const openRemoveDialog = (crewId: string, crewName: string, role: 'conductor' | 'driver', vehiclePlate: string) => {
    setRemoveDialog({ open: true, crewId, crewName, role, vehiclePlate });
  };

  const handleConfirmRemove = () => {
    unassignMutation.mutate({ crew_id: removeDialog.crewId, role: removeDialog.role });
  };

  return (
    <PageContainer>
      <PageHeader title="Assigned Vehicles" backHref="/user/vehicles" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {vehiclesLoading && (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
        )}
        {!vehiclesLoading && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl shadow-md overflow-x-auto bg-white">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {assignedVehicles.map((vehicle: Vehicle) => {
                const driver = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '3');
                const conductor = vehicle.crew?.find((c: CrewMember) => c.crew_role_id === '12');
                
                return (
                  <Card key={vehicle.vehicle_id} className="rounded-2xl shadow-md bg-white p-4">
                    {/* Vehicle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold uppercase">{vehicle.number_plate}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{vehicle.type_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conductor */}
                    {conductor && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10 bg-red-100">
                            <AvatarFallback className="bg-red-100 text-red-700 text-sm">
                              {conductor.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">COND.</div>
                            <div className="font-medium text-sm">{conductor.name}</div>
                          </div>
                          <button
                            onClick={() => openRemoveDialog(conductor.crew_id, conductor.name || 'Conductor', 'conductor', vehicle.number_plate)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                            aria-label="Remove conductor"
                          >
                            <XMarkIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Driver */}
                    {driver && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
                              {driver.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">DRIVER</div>
                            <div className="font-medium text-sm">{driver.name}</div>
                          </div>
                          <button
                            onClick={() => openRemoveDialog(driver.crew_id, driver.name || 'Driver', 'driver', vehicle.number_plate)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                            aria-label="Remove driver"
                          >
                            <XMarkIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reassign Button */}
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setSelectedRole(null);
                        setOpenAssign(true);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reassign
                    </Button>
                  </Card>
                );
              })}
              {assignedVehicles.length === 0 && (
                <div className="text-center text-gray-500 py-12">No assigned vehicles found</div>
              )}
            </div>
          </>
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
      <RemoveCrewDialog
        open={removeDialog.open}
        onOpenChange={(open) => !open && setRemoveDialog({ ...removeDialog, open: false })}
        crewName={removeDialog.crewName}
        vehiclePlate={removeDialog.vehiclePlate}
        loading={unassignMutation.isPending}
        onConfirm={handleConfirmRemove}
      />
    </PageContainer>
  );
}
