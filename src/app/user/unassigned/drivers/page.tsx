"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border bg-white shadow-sm">
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
                      <TableCell className="font-mono text-sm">{driver.badge_number || '-'}</TableCell>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {unassignedDrivers.map((driver) => (
                <Card 
                  key={driver.crew_id}
                  className="rounded-2xl shadow-md bg-white p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/user/crews/${driver.crew_id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-red-100 text-red-700 text-lg">
                        {getInitials(driver.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-500">
                            {driver.role_name ? driver.role_name.charAt(0) + driver.role_name.slice(1).toLowerCase() : 'Driver'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {driver.profile_completion_percentage || 0}%
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Badge:</span>
                          <span className="font-mono">{driver.badge_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Expiry:</span>
                          <span className={getBadgeExpiryDisplay(driver.badge_expiry).className}>
                            {getBadgeExpiryDisplay(driver.badge_expiry).text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm font-medium text-yellow-800">No vehicle assigned</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveCrew(driver); 
                          setOpenVehicleDialog(true); 
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Assign Vehicle
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {unassignedDrivers.length === 0 && (
                <div className="text-center text-gray-500 py-12">No pending drivers found</div>
              )}
            </div>
          </>
        )}
      </main>
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
