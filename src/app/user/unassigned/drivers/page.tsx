"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCrews } from '@/hooks/crew/useCrews';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog, AssignVehicleDialog } from '@/components/assign';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import type { Crew } from '@/types/crew';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function PendingDriversPage() {
  const router = useRouter();
  const { data: crewsData, isLoading } = useCrews();
  const { data: vehiclesData } = useVehicles();
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [activeCrew, setActiveCrew] = useState<Crew | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [conflictState, setConflictState] = useState<{ open: boolean; error: string; message: string; pendingIds: string[] }>({ open: false, error: '', message: '', pendingIds: [] });

  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);
  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);

  // Filter unassigned crews (crews without a vehicle)
  const unassignedCrews = useMemo(() => {
    return crews.filter((c: Crew) => !c.vehicle_id);
  }, [crews]);

  const unassignedDrivers = useMemo(() => {
    return unassignedCrews.filter((c: Crew) => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  }, [unassignedCrews]);

  // Show all vehicles for assignment (matching the requirement to show all vehicles)
  const assignableVehicles = useMemo(() => {
    return vehicles.map(v => ({
      vehicle_id: v.vehicle_id,
      number_plate: v.number_plate,
      type_name: v.type_name
    }));
  }, [vehicles]);

  const assignMutation = useAssignVehicle({
    onSuccess: (data) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictState({ open: true, error: data.error || 'Conflict detected', message: data.message || '', pendingIds: data.pending_assignment_ids });
      } else {
        toast.success(data.message || 'Vehicle assigned successfully');
        setOpenVehicleDialog(false);
        setActiveCrew(null);
        setSelectedVehicleId('');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to assign vehicle');
      console.error(err);
    }
  });
  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment confirmed successfully');
      setConflictState({ open: false, error: '', message: '', pendingIds: [] });
      setOpenVehicleDialog(false);
      setActiveCrew(null);
      setSelectedVehicleId('');
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
    if (!activeCrew || !selectedVehicleId) return;
    assignMutation.mutate({ vehicle_id: Number(selectedVehicleId), crew_id: Number(activeCrew.crew_id) });
  };

  const handleDialogClose = () => {
    setOpenVehicleDialog(false);
    setActiveCrew(null);
    setSelectedVehicleId('');
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
      <PageHeader title="Pending Drivers" backHref="/user/unassigned" />
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
                {unassignedDrivers.map((driver) => (
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
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">-</span>
                        <button
                          type="button"
                          aria-label="Assign vehicle"
                          className="text-purple-700 hover:text-purple-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCrew(driver);
                            setOpenVehicleDialog(true);
                          }}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={getBadgeExpiryDisplay(driver.badge_expiry).className}>
                        {getBadgeExpiryDisplay(driver.badge_expiry).text}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedDrivers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No pending drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <AssignVehicleDialog
        open={openVehicleDialog}
        onOpenChange={(open) => !open && handleDialogClose()}
        crew={activeCrew}
        vehicles={assignableVehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
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
