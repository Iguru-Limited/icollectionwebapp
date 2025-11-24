"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/hooks/crew/useCrews';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import type { Crew } from '@/types/crew';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface VehicleSummary {
  vehicle_id: string | number;
  number_plate: string;
  crew?: { crew_role_id: string }[];
}

export default function PendingConductorsPage() {
  const router = useRouter();
  const { data: crewsData, isLoading } = useCrews();
  const { data: vehiclesData } = useVehicles();
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [activeCrew, setActiveCrew] = useState<Crew | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);
  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);

  // Filter unassigned crews (crews without a vehicle)
  const unassignedCrews = useMemo(() => {
    return crews.filter((c: Crew) => !c.vehicle_id);
  }, [crews]);

  const unassignedConductors = useMemo(() => {
    return unassignedCrews.filter((c: Crew) => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');
  }, [unassignedCrews]);

  const assignableVehicles: VehicleSummary[] = useMemo(() => {
    return vehicles
      .filter(v => !v.crew || v.crew.length === 0)
      .map(v => ({
        vehicle_id: v.vehicle_id,
        number_plate: v.number_plate,
        crew: v.crew
      }));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return assignableVehicles;
    const s = vehicleSearch.toLowerCase();
    return assignableVehicles.filter(v => v.number_plate.toLowerCase().includes(s));
  }, [assignableVehicles, vehicleSearch]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({ open: true, error: data.error || 'Conflict detected', message: data.message || '', pendingIds: data.pending_assignment_ids });
      } else {
        setOpenVehicleDialog(false);
        setActiveCrew(null);
      }
    },
    onError: (err) => console.error(err)
  });
  const confirmMutation = useConfirmAssignment({
    onSuccess: () => setConflictState({ open: false, error: '', message: '', pendingIds: [] }),
    onError: (e) => console.error(e)
  });
  const cancelMutation = useCancelAssignment({
    onSuccess: () => setConflictState({ open: false, error: '', message: '', pendingIds: [] }),
    onError: (e) => console.error(e)
  });

  const handleAssign = (vehicleId: number) => {
    if (!activeCrew) return;
    assignMutation.mutate({ vehicle_id: vehicleId, crew_id: Number(activeCrew.crew_id) });
  };

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

  return (
    <PageContainer>
      <PageHeader title="Pending Conductors" backHref="/user/unassigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <div className="rounded-lg border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Badge No.</TableHead>
                  <TableHead>Badge Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedConductors.map((conductor) => (
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
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">-</span>
                        <button
                          type="button"
                          aria-label="Assign vehicle"
                          className="text-purple-700 hover:text-purple-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCrew(conductor);
                            setOpenVehicleDialog(true);
                          }}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={getBadgeExpiryDisplay(conductor.badge_expiry).className}>
                        {getBadgeExpiryDisplay(conductor.badge_expiry).text}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedConductors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No pending conductors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Dialog open={openVehicleDialog} onOpenChange={(o) => { if(!o){ setOpenVehicleDialog(false); setActiveCrew(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Assign Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Crew: <span className="font-medium">{activeCrew?.name}</span></div>
            <Input
              placeholder="Search vehicle by plate"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.vehicle_id} className="hover:bg-gray-50">
                      <TableCell className="font-mono uppercase text-sm">{v.number_plate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={assignMutation.isPending}
                          onClick={() => handleAssign(Number(v.vehicle_id))}
                        >
                          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500 py-6">No vehicles available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpenVehicleDialog(false); setActiveCrew(null); }}>Close</Button>
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
