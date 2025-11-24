"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const [search, setSearch] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const vehicles: Vehicle[] = useMemo(() => (vehiclesData?.data || []) as Vehicle[], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Assigned vehicles have at least one crew member
  const assignedVehicles: Vehicle[] = useMemo(() => vehicles.filter((v: Vehicle) => v.crew && v.crew.length > 0), [vehicles]);

  // Unassigned crews by role
  const unassignedCrews = useMemo(() => crews.filter(c => !c.vehicle_id), [crews]);
  const unassignedDrivers = useMemo(() => unassignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER'), [unassignedCrews]);
  const unassignedConductors = useMemo(() => unassignedCrews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR'), [unassignedCrews]);

  const visibleCrew = useMemo(() => {
    const base = selectedRole === 'driver' ? unassignedDrivers : unassignedConductors;
    if (!search.trim()) return base;
    const s = search.toLowerCase();
    return base.filter(c => c.name.toLowerCase().includes(s) || c.badge_number?.toLowerCase().includes(s));
  }, [selectedRole, unassignedDrivers, unassignedConductors, search]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({ open: true, error: data.error || 'Conflict detected', message: data.message || '', pendingIds: data.pending_assignment_ids });
      } else {
        setOpenAssign(false);
        setSelectedVehicle(null);
        setSelectedRole(null);
      }
    },
    onError: (err) => console.error(err)
  });

  const confirmMutation = useConfirmAssignment({
    onSuccess: () => {
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
      setOpenAssign(false);
    },
    onError: (e) => console.error(e)
  });
  const cancelMutation = useCancelAssignment({
    onSuccess: () => setConflictState({ open: false, error: '', message: '', pendingIds: [] }),
    onError: (e) => console.error(e)
  });

  const handleAssign = (crewId: string) => {
    if (!selectedVehicle) return;
    assignMutation.mutate({ vehicle_id: Number(selectedVehicle.vehicle_id), crew_id: Number(crewId) });
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
      <Dialog open={openAssign} onOpenChange={(o) => { if (!o) { setOpenAssign(false); setSelectedRole(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Assign {selectedRole === 'driver' ? 'Driver' : 'Conductor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Vehicle: <span className="font-medium uppercase">{selectedVehicle?.number_plate}</span></div>
            <Input
              placeholder={`Search ${selectedRole === 'driver' ? 'drivers' : 'conductors'} by name or badge`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCrew.map(c => (
                    <TableRow key={c.crew_id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-sm">{c.badge_number || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={assignMutation.isPending}
                          onClick={() => handleAssign(c.crew_id)}
                        >
                          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visibleCrew.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-6">No matching crew found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpenAssign(false); setSelectedRole(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
