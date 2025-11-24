"use client";
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useState, useMemo, useEffect } from 'react';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import type { VehicleItem } from '@/types/vehicle';

export default function VehicleSearchPage() {
  const [q, setQ] = useState('');
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; vehicle: VehicleItem | null }>({
    open: false,
    vehicle: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedConductorId, setSelectedConductorId] = useState('');
  const [editDriver, setEditDriver] = useState(false);
  const [editConductor, setEditConductor] = useState(false);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({ open: false, error: '', message: '', pendingIds: [] });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { data: crewsData } = useCrews();
  const vehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Preload current crew assignments when dialog opens
  useEffect(() => {
    if (assignDialog.open && assignDialog.vehicle) {
      const currentDriver = assignDialog.vehicle.crew?.find(c => c.crew_role_id === '3');
      const currentConductor = assignDialog.vehicle.crew?.find(c => c.crew_role_id === '12');
      setSelectedDriverId(currentDriver?.crew_id || '');
      setSelectedConductorId(currentConductor?.crew_id || '');
      setEditDriver(false);
      setEditConductor(false);
    }
  }, [assignDialog.open, assignDialog.vehicle]);

  // Filter vehicles by search query
  const filteredVehicles = useMemo(() => {
    const raw = q.trim();
    if (!raw) return [];
    const query = raw.toLowerCase();
    return vehicles.filter(v => {
      const plate = (v.number_plate || '').toLowerCase();
      const type = (v.type_name || '').toLowerCase();
      const driver = v.crew?.find(c => c.crew_role_id === '3')?.name?.toLowerCase() || '';
      const conductor = v.crew?.find(c => c.crew_role_id === '12')?.name?.toLowerCase() || '';
      return plate.includes(query) || type.includes(query) || driver.includes(query) || conductor.includes(query);
    });
  }, [q, vehicles]);

  // Get drivers and conductors
  const drivers = crews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  const conductors = crews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');

  // Filter crews by search query in dialog
  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const query = searchQuery.toLowerCase();
    return drivers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.badge_number?.toLowerCase().includes(query)
    );
  }, [searchQuery, drivers]);

  const filteredConductors = useMemo(() => {
    if (!searchQuery) return conductors;
    const query = searchQuery.toLowerCase();
    return conductors.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.badge_number?.toLowerCase().includes(query)
    );
  }, [searchQuery, conductors]);

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      handleDialogClose();
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
        toast.success('Crew assigned successfully');
        handleDialogClose();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign crew');
    },
  });

  const handleAssign = () => {
    if (!assignDialog.vehicle) return;
    
    const crewIds = [selectedDriverId, selectedConductorId].filter(Boolean);
    if (crewIds.length === 0) {
      toast.error('Select at least one crew member');
      return;
    }

    const crewIdPayload = crewIds.length === 1 ? Number(crewIds[0]) : crewIds.map(id => Number(id));
    assignMutation.mutate({
      crew_id: crewIdPayload,
      vehicle_id: Number(assignDialog.vehicle.vehicle_id),
    });
  };

  const handleDialogClose = () => {
    setAssignDialog({ open: false, vehicle: null });
    setSelectedDriverId('');
    setSelectedConductorId('');
    setSearchQuery('');
    setEditDriver(false);
    setEditConductor(false);
  };

  const handleUnassignDriver = () => {
    setSelectedDriverId('');
    setEditDriver(true);
  };

  const handleUnassignConductor = () => {
    setSelectedConductorId('');
    setEditConductor(true);
  };

  const openAssignDialog = (vehicle: VehicleItem) => {
    setAssignDialog({ open: true, vehicle });
  };

  return (
    <PageContainer>
      <PageHeader title="Search vehicles" />
      <main className="px-4 pb-24 max-w-md mx-auto space-y-6">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search by plate or type..."
        />
        
        {vehiclesLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!vehiclesLoading && q && filteredVehicles.length === 0 && (
          <div className="text-center text-gray-500 py-12">No vehicles found</div>
        )}

        {!vehiclesLoading && filteredVehicles.length > 0 && (
          <div className="space-y-3">
            {filteredVehicles.map((vehicle) => {
              const driver = vehicle.crew?.find(c => c.crew_role_id === '3');
              const conductor = vehicle.crew?.find(c => c.crew_role_id === '12');
              
              return (
                <Card
                  key={vehicle.vehicle_id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openAssignDialog(vehicle)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg uppercase">{vehicle.number_plate}</div>
                        <div className="text-sm text-gray-600">{vehicle.type_name || 'Unknown Type'}</div>
                      </div>
                      <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                        Manage
                      </Button>
                    </div>
                    
                    {/* Crew information */}
                    <div className="text-sm space-y-1 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Driver:</span>
                        <span className="font-medium text-gray-900">{driver?.name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Conductor:</span>
                        <span className="font-medium text-gray-900">{conductor?.name || '-'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Manage Crew for {assignDialog.vehicle?.number_plate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Driver Section */}
            <div className="space-y-2">
              <Label>Driver</Label>
              {!editDriver && selectedDriverId ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <span className="font-medium">
                    {crews.find(c => c.crew_id === selectedDriverId)?.name || 'Unknown'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditDriver(true)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Edit driver"
                    >
                      <PencilIcon className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={handleUnassignDriver}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Unassign driver"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger id="driver-select">
                    <SelectValue placeholder="Choose a driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-1">
                      <Input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type to search driver..."
                        className="h-9"
                      />
                    </div>
                    {filteredDrivers.map((driver) => (
                      <SelectItem key={driver.crew_id} value={driver.crew_id}>
                        {driver.name} {driver.badge_number ? `(${driver.badge_number})` : ''}
                      </SelectItem>
                    ))}
                    {filteredDrivers.length === 0 && (
                      <div className="p-2 text-sm text-gray-500">
                        {searchQuery ? 'No matching drivers found' : 'No drivers available'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Current Conductor Section */}
            <div className="space-y-2">
              <Label>Conductor</Label>
              {!editConductor && selectedConductorId ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <span className="font-medium">
                    {crews.find(c => c.crew_id === selectedConductorId)?.name || 'Unknown'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditConductor(true)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Edit conductor"
                    >
                      <PencilIcon className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={handleUnassignConductor}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Unassign conductor"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <Select value={selectedConductorId} onValueChange={setSelectedConductorId}>
                  <SelectTrigger id="conductor-select">
                    <SelectValue placeholder="Choose a conductor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-1">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type to search conductor..."
                        className="h-9"
                      />
                    </div>
                    {filteredConductors.map((conductor) => (
                      <SelectItem key={conductor.crew_id} value={conductor.crew_id}>
                        {conductor.name} {conductor.badge_number ? `(${conductor.badge_number})` : ''}
                      </SelectItem>
                    ))}
                    {filteredConductors.length === 0 && (
                      <div className="p-2 text-sm text-gray-500">
                        {searchQuery ? 'No matching conductors found' : 'No conductors available'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose} disabled={assignMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || (!selectedDriverId && !selectedConductorId)}
            >
              {assignMutation.isPending ? 'Updating...' : 'Update Crew'}
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
    </PageContainer>
  );
}
