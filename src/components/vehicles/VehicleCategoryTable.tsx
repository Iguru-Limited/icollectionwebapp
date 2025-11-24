"use client";
import { useState, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({ open: false, error: '', message: '', pendingIds: [] });
  
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

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      handleDialogClose();
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to confirm assignment');
    },
  });

  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Pending assignment request(s) cancelled successfully');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel assignment');
    },
  });

  const assignMutation = useAssignVehicle({
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
        toast.success(`${assignDialog.role === 'driver' ? 'Driver' : 'Conductor'} assigned successfully`);
        handleDialogClose();
        window.location.reload();
      }
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
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    if (assignDialog.open) {
      setSearchQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [assignDialog.open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || availableCrews.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < availableCrews.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && availableCrews[selectedIndex]) {
          handleSelectCrew(availableCrews[selectedIndex].crew_id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectCrew = (crewId: string) => {
    const crew = crews.find((c) => c.crew_id === crewId);
    if (crew) {
      setSelectedCrewId(crewId);
      setSearchQuery(crew.name);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    
    const selectedCrew = crews.find((c) => c.crew_id === selectedCrewId);
    if (selectedCrew && newValue !== selectedCrew.name) {
      setSelectedCrewId('');
    }
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
              <Label htmlFor="crew-search">
                Select {assignDialog.role === 'driver' ? 'Driver' : 'Conductor'}
              </Label>
              <div className="relative">
                <Input
                  id="crew-search"
                  ref={inputRef}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={`Type to search ${assignDialog.role}...`}
                  className="w-full"
                />
                
                {showSuggestions && searchQuery && availableCrews.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {availableCrews.map((crew, index) => (
                      <div
                        key={crew.crew_id}
                        className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                          index === selectedIndex
                            ? 'bg-purple-50 text-purple-900'
                            : 'hover:bg-gray-50'
                        } ${
                          crew.crew_id === selectedCrewId
                            ? 'bg-purple-100'
                            : ''
                        }`}
                        onClick={() => handleSelectCrew(crew.crew_id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="text-sm">
                          {crew.name} {crew.badge_number ? `(${crew.badge_number})` : ''}
                        </span>
                        {crew.crew_id === selectedCrewId && (
                          <CheckIcon className="w-4 h-4 text-purple-700" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {showSuggestions && searchQuery && availableCrews.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'No matching crew found' : `No ${assignDialog.role}s available`}
                    </p>
                  </div>
                )}
              </div>

              {selectedCrewId && crews.find(c => c.crew_id === selectedCrewId) && (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <CheckIcon className="w-4 h-4" />
                  <span>Selected: {crews.find(c => c.crew_id === selectedCrewId)?.name}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedCrewId}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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