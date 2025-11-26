import type { Crew } from '@/types/crew';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { AssignVehicleDialog } from '@/components/assign/AssignVehicleDialog';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CrewListProps {
  crews: Crew[];
  isLoading?: boolean;
}

export function CrewList({ crews, isLoading }: CrewListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const vehicles = template?.vehicles || [];
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeCrew, setActiveCrew] = useState<Crew | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({ open: false, error: '', message: '', pendingIds: [] });

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast?.success?.(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      setOpen(false);
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
    },
    onError: (error) => {
      toast?.error?.(error.message || 'Failed to confirm assignment');
    },
  });

  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast?.success?.(data.message || 'Pending assignment request(s) cancelled successfully');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (error) => {
      toast?.error?.(error.message || 'Failed to cancel assignment');
    },
  });

  const { mutate: assignVehicle, isPending } = useAssignVehicle({
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
        toast?.success?.('Vehicle assigned successfully');
        setOpen(false);
        const companyId = session?.user?.company?.company_id;
        queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      }
    },
    onError: (err) => {
      toast?.error?.(err.message || 'Failed to assign vehicle');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No crew members found</EmptyTitle>
          <EmptyDescription>Try adjusting your search or filter criteria</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
          {crews.map((crew) => (
            <TableRow
              key={crew.crew_id}
              className="cursor-pointer"
              onClick={() => router.push(`/user/crews/${crew.crew_id}`)}
            >
              <TableCell>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {getInitials(crew.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Profile Completion Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                    {crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{crew.name}</TableCell>
              <TableCell>{crew.role_name ? crew.role_name.charAt(0) + crew.role_name.slice(1).toLowerCase() : '-'}</TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span>{crew.vehicle_plate || '-'}</span>
                  <button
                    type="button"
                    aria-label="Assign vehicle"
                    className="text-purple-700 hover:text-purple-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCrew(crew);
                      setSelectedVehicleId(crew.vehicle_id || '');
                      setOpen(true);
                    }}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{crew.badge_number || '-'}</TableCell>
              <TableCell className="text-sm">
                <span className={getBadgeExpiryDisplay(crew.badge_expiry).className}>
                  {getBadgeExpiryDisplay(crew.badge_expiry).text}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AssignVehicleDialog
        open={open}
        onOpenChange={setOpen}
        crew={activeCrew}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        loading={isPending}
        onConfirm={() => {
          if (!activeCrew || !selectedVehicleId) return;
          assignVehicle({
            vehicle_id: Number(selectedVehicleId),
            crew_id: Number(activeCrew.crew_id),
          });
        }}
      />

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
    </div>
  );
}
