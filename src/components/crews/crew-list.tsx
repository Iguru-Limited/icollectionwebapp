import type { Crew } from '@/types/crew';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckIcon } from '@heroicons/react/24/solid';

interface CrewListProps {
  crews: Crew[];
  isLoading?: boolean;
}

export function CrewList({ crews, isLoading }: CrewListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  // template not needed here; dialog fetches vehicles directly
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeCrew, setActiveCrew] = useState<Crew | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
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
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(crew.name)}
                  </AvatarFallback>
                </Avatar>
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
                      setSelectedVehicleId(crew.vehicle_id || null);
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
        value={selectedVehicleId}
        onValueChange={(v) => setSelectedVehicleId(v)}
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

// Dialog for assigning vehicle to a crew

function AssignVehicleDialog({
  open,
  onOpenChange,
  crew,
  value,
  onValueChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  crew: Crew | null;
  value: string | null;
  onValueChange: (v: string) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const template = useCompanyTemplateStore((s) => s.template);
  const vehicles = template?.vehicles || [];
  const [q, setQ] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filtered = vehicles.filter((v) =>
    v.number_plate.toLowerCase().includes(q.toLowerCase()) || String(v.vehicle_id).includes(q),
  );

  const selectedVehicle = vehicles.find((v) => String(v.vehicle_id) === value);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQ('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filtered[selectedIndex]) {
          handleSelectVehicle(filtered[selectedIndex].vehicle_id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    if (vehicle) {
      onValueChange(String(vehicleId));
      setQ(vehicle.number_plate);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQ(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    
    // Clear selection if user modifies the input
    if (selectedVehicle && newValue !== selectedVehicle.number_plate) {
      onValueChange('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            {crew ? (
              <span>
                {crew.name} {crew.role_name ? `(${crew.role_name})` : ''}
              </span>
            ) : (
              'No crew selected'
            )}
          </div>
          
          <div className="relative">
            <Input
              ref={inputRef}
              value={q}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Type to search vehicle..."
              className="w-full"
            />
            
            {showSuggestions && q && filtered.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {filtered.map((vehicle, index) => (
                  <div
                    key={vehicle.vehicle_id}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                      index === selectedIndex
                        ? 'bg-purple-50 text-purple-900'
                        : 'hover:bg-gray-50'
                    } ${
                      String(vehicle.vehicle_id) === value
                        ? 'bg-purple-100'
                        : ''
                    }`}
                    onClick={() => handleSelectVehicle(vehicle.vehicle_id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="font-mono text-sm">{vehicle.number_plate}</span>
                    {String(vehicle.vehicle_id) === value && (
                      <CheckIcon className="w-4 h-4 text-purple-700" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {showSuggestions && q && filtered.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                <p className="text-sm text-gray-500">No vehicles found</p>
              </div>
            )}
          </div>

          {selectedVehicle && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckIcon className="w-4 h-4" />
              <span>Selected: {selectedVehicle.number_plate}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading || !value}>
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
