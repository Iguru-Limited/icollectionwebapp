import type { Crew } from '@/types/crew';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
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
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeCrew, setActiveCrew] = useState<Crew | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { mutate: assignVehicle, isPending } = useAssignVehicle({
    onSuccess: () => {
      toast?.success?.('Vehicle assigned successfully');
      setOpen(false);
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
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

  const isExpired = (expiryDate: string | null) => {
    return expiryDate ? new Date(expiryDate) < new Date() : false;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
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
  const filtered = vehicles.filter((v) =>
    v.number_plate.toLowerCase().includes(q.toLowerCase()) || String(v.vehicle_id).includes(q),
  );

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
          <Select value={value || ''} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 pb-1">
                <Input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Type to search vehicle..."
                  className="h-9"
                />
              </div>
              {filtered.map((v) => (
                <SelectItem key={v.vehicle_id} value={String(v.vehicle_id)}>
                  {v.number_plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
