"use client";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { toast } from 'sonner';
import type { VehicleItem } from '@/types/vehicle';

interface VehicleCategoryTableProps {
  vehicles: VehicleItem[];
  isLoading?: boolean;
}

// Helper to extract first matching crew member by role id or role name heuristic
function findCrew(crew: VehicleItem['crew'], roleIds: string[], roleNames: string[]): string | null {
  const match = crew.find(c => roleIds.includes(c.crew_role_id) || roleNames.some(r => r === c.crew_role_id));
  return match?.name || null;
}

function getDriverName(crew: VehicleItem['crew']): string | null {
  // Known driver role_id examples: '3'
  return findCrew(crew, ['3'], ['DRIVER']);
}

function getConductorName(crew: VehicleItem['crew']): string | null {
  // Known conductor role_id examples: '12'
  return findCrew(crew, ['12'], ['CONDUCTOR']);
}

export function VehicleCategoryTable({ vehicles, isLoading }: VehicleCategoryTableProps) {
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; vehicleId: string; vehiclePlate: string; role: 'driver' | 'conductor' | null }>({
    open: false,
    vehicleId: '',
    vehiclePlate: '',
    role: null,
  });
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: crewsData } = useCrews();
  const crews = crewsData?.data || [];
  
  // Filter crews by role for the assignment dialog
  const roleFilteredCrews = assignDialog.role === 'driver' 
    ? crews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER')
    : assignDialog.role === 'conductor'
    ? crews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR')
    : [];

  // Further filter by search query
  const availableCrews = roleFilteredCrews.filter(crew => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return crew.name.toLowerCase().includes(query) || 
           crew.badge_number?.toLowerCase().includes(query);
  });

  const assignMutation = useAssignVehicle({
    onSuccess: () => {
      toast.success(`${assignDialog.role === 'driver' ? 'Driver' : 'Conductor'} assigned successfully`);
      handleDialogClose();
      // Refresh vehicles list
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign crew');
    },
  });

  const handleAssign = () => {
    if (!selectedCrewId || !assignDialog.vehicleId) {
      toast.error('Please select a crew member');
      return;
    }
    assignMutation.mutate({
      crew_id: Number(selectedCrewId),
      vehicle_id: Number(assignDialog.vehicleId),
    });
  };

  const handleDialogClose = () => {
    setAssignDialog({ open: false, vehicleId: '', vehiclePlate: '', role: null });
    setSelectedCrewId('');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
        ))}
      </Card>
    );
  }

  if (vehicles.length === 0) {
    return <Card className="p-8 text-center text-gray-500">No vehicles found</Card>;
  }

  return (
    <>
      <Card className="overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Conductor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v, idx) => {
              const driver = getDriverName(v.crew) || '-';
              const conductor = getConductorName(v.crew) || '-';
              return (
                <TableRow key={v.vehicle_id} className="hover:bg-gray-50">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium uppercase">{v.number_plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{driver}</span>
                      <button
                        onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'driver' })}
                        className="text-purple-600 hover:text-purple-800"
                        aria-label="Assign driver"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{conductor}</span>
                      <button
                        onClick={() => setAssignDialog({ open: true, vehicleId: v.vehicle_id, vehiclePlate: v.number_plate, role: 'conductor' })}
                        className="text-purple-600 hover:text-purple-800"
                        aria-label="Assign conductor"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign {assignDialog.role === 'driver' ? 'Driver' : 'Conductor'} to {assignDialog.vehiclePlate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="crew-select">
                Select {assignDialog.role === 'driver' ? 'Driver' : 'Conductor'}
              </Label>
              <Select value={selectedCrewId} onValueChange={setSelectedCrewId}>
                <SelectTrigger id="crew-select">
                  <SelectValue placeholder={`Choose a ${assignDialog.role}...`} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-1">
                    <Input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Type to search ${assignDialog.role}...`}
                      className="h-9"
                    />
                  </div>
                  {availableCrews.map((crew) => (
                    <SelectItem key={crew.crew_id} value={crew.crew_id}>
                      {crew.name} {crew.badge_number ? `(${crew.badge_number})` : ''}
                    </SelectItem>
                  ))}
                  {availableCrews.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">
                      {searchQuery ? 'No matching crew found' : `No ${assignDialog.role}s available`}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assignMutation.isPending || !selectedCrewId}
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}