"use client";
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useState, useMemo } from 'react';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
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

  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { data: crewsData } = useCrews();
  const vehicles = vehiclesData?.data || [];
  const crews = crewsData?.data || [];

  // Filter vehicles by search query
  const filteredVehicles = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return vehicles.filter(v => 
      v.number_plate.toLowerCase().includes(query) ||
      v.type_name.toLowerCase().includes(query)
    );
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

  const assignMutation = useAssignVehicle({
    onSuccess: () => {
      toast.success('Crew assigned successfully');
      handleDialogClose();
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
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.vehicle_id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openAssignDialog(vehicle)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg uppercase">{vehicle.number_plate}</div>
                    <div className="text-sm text-gray-600">{vehicle.type_name}</div>
                  </div>
                  <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                    Assign
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Crew to {assignDialog.vehicle?.number_plate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Crew</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter crew..."
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driver-select">Select Driver</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger id="driver-select">
                  <SelectValue placeholder="Choose a driver..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredDrivers.map((driver) => (
                    <SelectItem key={driver.crew_id} value={driver.crew_id}>
                      {driver.name} {driver.badge_number ? `(${driver.badge_number})` : ''}
                    </SelectItem>
                  ))}
                  {filteredDrivers.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">No drivers available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conductor-select">Select Conductor</Label>
              <Select value={selectedConductorId} onValueChange={setSelectedConductorId}>
                <SelectTrigger id="conductor-select">
                  <SelectValue placeholder="Choose a conductor..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredConductors.map((conductor) => (
                    <SelectItem key={conductor.crew_id} value={conductor.crew_id}>
                      {conductor.name} {conductor.badge_number ? `(${conductor.badge_number})` : ''}
                    </SelectItem>
                  ))}
                  {filteredConductors.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">No conductors available</div>
                  )}
                </SelectContent>
              </Select>
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
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
