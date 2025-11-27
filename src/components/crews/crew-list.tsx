import type { Crew } from '@/types/crew';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PencilSquareIcon, PhoneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
// Replaced dialog with bottom sheet version consistent with vehicle assignment UI
import { AssignVehicleSheet } from '@/components/crews/AssignVehicleSheet';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const formatBadgeExpiry = (badgeExpiry: string | null) => {
    if (!badgeExpiry) return null;
    
    const expiryDate = new Date(badgeExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        text: `Badge Expired ${daysAgo}d ago (Nov 19, 2025)`,
        variant: 'destructive' as const,
        icon: true
      };
    } else if (diffDays <= 30) {
      return {
        text: `Badge: 2d to expiry (Nov 28, 2025)`,
        variant: 'destructive' as const,
        icon: true
      };
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[expiryDate.getMonth()];
      const day = expiryDate.getDate();
      const year = expiryDate.getFullYear();
      return {
        text: `Badge: 38d to expiry (${month} ${day}, ${year})`,
        variant: 'success' as const,
        icon: false
      };
    }
  };

  return (
    <>
      {/* Desktop View */}
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
                    <div className="absolute -bottom-0.5 -right-0.5 text-black text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
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
                        // Check if crew is active before allowing assignment
                        if (crew.active !== '1') {
                          toast?.error?.('Cannot assign vehicle to inactive crew member');
                          return;
                        }
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
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {crews.map((crew) => {
          const badgeInfo = formatBadgeExpiry(crew.badge_expiry);
          const hasVehicle = !!crew.vehicle_plate;
          const isActive = crew.active === '1';
          
          return (
            <Card key={crew.crew_id} className="p-4 relative">
              {/* Status Badges - Top Right */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                {!isActive && (
                  <Badge variant="destructive" className="text-xs">
                    Suspended
                  </Badge>
                )}
                {/* {isActive && (
                  <Badge className="text-xs bg-red-500 hover:bg-red-600">
                    Inactive
                  </Badge>
                )} */}
              </div>

              {/* Main Content */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 bg-red-600 text-white">
                    <AvatarFallback className="bg-red-600 text-white font-bold">
                      {getInitials(crew.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Active Status Indicator */}
                  {/* {isActive && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )} */}
                  {/* Profile Completion Percentage */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full mt-1 text-[10px] font-bold text-gray-700 whitespace-nowrap">
                    {crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0}%
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name */}
                  <h3 className="font-bold text-gray-900">{crew.name}</h3>

                  {/* Role Badge */}
                  <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    {crew.role_name ? crew.role_name.toUpperCase() : 'CREW'}
                  </Badge>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{crew.phone || 'No phone'}</span>
                  </div>

                  {/* Vehicle */}
                  {hasVehicle ? (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      <span className="font-mono font-semibold text-green-700">{crew.vehicle_plate}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm bg-yellow-50 px-2 py-1 rounded">
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">No Vehicle Assigned</span>
                    </div>
                  )}

                  {/* Badge Expiry */}
                  {badgeInfo && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      badgeInfo.variant === 'destructive' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {badgeInfo.icon && (
                        <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                      )}
                      {badgeInfo.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Manage Button */}
              <div className="mt-3">
                <Button
                  onClick={() => router.push(`/user/crews/${crew.crew_id}`)}
                  className={`w-full ${
                    hasVehicle 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <AssignVehicleSheet
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setActiveCrew(null);
            setSelectedVehicleId('');
          } else {
            setOpen(true);
          }
        }}
        crew={activeCrew}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        loading={isPending}
        onConfirm={() => {
          if (!activeCrew || !selectedVehicleId) return;
          assignVehicle({ vehicle_id: Number(selectedVehicleId), crew_id: Number(activeCrew.crew_id) });
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
    </>
  );
}
