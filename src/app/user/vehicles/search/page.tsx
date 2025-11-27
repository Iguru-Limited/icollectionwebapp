"use client";
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useState, useMemo, useEffect } from 'react';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog, AssignCrewDialog } from '@/components/assign';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import type { VehicleItem } from '@/types/vehicle';

export default function VehicleSearchPage() {
  const [q, setQ] = useState('');
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; vehicle: VehicleItem | null; role: 'driver' | 'conductor' | null }>({
    open: false,
    vehicle: null,
    role: null,
  });
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedConductorId, setSelectedConductorId] = useState('');
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
      if (assignDialog.role === 'driver') {
        const currentDriver = assignDialog.vehicle.crew?.find(c => c.crew_role_id === '3');
        setSelectedDriverId(currentDriver?.crew_id || '');
      } else if (assignDialog.role === 'conductor') {
        const currentConductor = assignDialog.vehicle.crew?.find(c => c.crew_role_id === '12');
        setSelectedConductorId(currentConductor?.crew_id || '');
      }
    }
  }, [assignDialog.open, assignDialog.vehicle, assignDialog.role]);

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
  const drivers = crews.filter(c => (c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER') && c.active === '1');
  const conductors = crews.filter(c => (c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR') && c.active === '1');

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
    if (!assignDialog.vehicle || !assignDialog.role) return;
    
    const crewId = assignDialog.role === 'driver' ? selectedDriverId : selectedConductorId;
    if (!crewId) {
      toast.error(`Select a ${assignDialog.role}`);
      return;
    }

    assignMutation.mutate({
      crew_id: Number(crewId),
      vehicle_id: Number(assignDialog.vehicle.vehicle_id),
    });
  };

  const handleDialogClose = () => {
    setAssignDialog({ open: false, vehicle: null, role: null });
    setSelectedDriverId('');
    setSelectedConductorId('');
  };

  const openAssignDialog = (vehicle: VehicleItem, role: 'driver' | 'conductor') => {
    setAssignDialog({ open: true, vehicle, role });
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
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg uppercase">{vehicle.number_plate}</div>
                        <div className="text-sm text-gray-600">{vehicle.type_name || 'Unknown Type'}</div>
                      </div>
                    </div>
                    
                    {/* Crew information */}
                    <div className="text-sm space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500">Driver:</span>
                          <span className="font-medium text-gray-900 ml-2">{driver?.name || '-'}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openAssignDialog(vehicle, 'driver')}
                          className="text-xs"
                        >
                          {driver ? 'Change' : 'Assign'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500">Conductor:</span>
                          <span className="font-medium text-gray-900 ml-2">{conductor?.name || '-'}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openAssignDialog(vehicle, 'conductor')}
                          className="text-xs"
                        >
                          {conductor ? 'Change' : 'Assign'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Driver Assignment Dialog */}
      {assignDialog.vehicle && assignDialog.role === 'driver' && (
        <AssignCrewDialog
          open={assignDialog.open}
          onOpenChange={(open) => !open && handleDialogClose()}
          crews={drivers}
          selectedCrewId={selectedDriverId}
          onCrewChange={setSelectedDriverId}
          onConfirm={handleAssign}
          title={`Assign Driver to ${assignDialog.vehicle.number_plate}`}
          description="Select a driver for this vehicle"
          placeholder="Search driver by name or badge..."
          loading={assignMutation.isPending}
        />
      )}

      {/* Conductor Assignment Dialog */}
      {assignDialog.vehicle && assignDialog.role === 'conductor' && (
        <AssignCrewDialog
          open={assignDialog.open}
          onOpenChange={(open) => !open && handleDialogClose()}
          crews={conductors}
          selectedCrewId={selectedConductorId}
          onCrewChange={setSelectedConductorId}
          onConfirm={handleAssign}
          title={`Assign Conductor to ${assignDialog.vehicle.number_plate}`}
          description="Select a conductor for this vehicle"
          placeholder="Search conductor by name or badge..."
          loading={assignMutation.isPending}
        />
      )}

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
