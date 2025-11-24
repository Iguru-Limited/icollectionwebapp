"use client";
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useState, useMemo, useEffect, useRef } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const [showConductorSuggestions, setShowConductorSuggestions] = useState(false);
  const [driverSelectedIndex, setDriverSelectedIndex] = useState(-1);
  const [conductorSelectedIndex, setConductorSelectedIndex] = useState(-1);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [conductorSearchQuery, setConductorSearchQuery] = useState('');
  const driverInputRef = useRef<HTMLInputElement>(null);
  const conductorInputRef = useRef<HTMLInputElement>(null);
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
    if (!driverSearchQuery) return drivers;
    const query = driverSearchQuery.toLowerCase();
    return drivers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.badge_number?.toLowerCase().includes(query)
    );
  }, [driverSearchQuery, drivers]);

  const filteredConductors = useMemo(() => {
    if (!conductorSearchQuery) return conductors;
    const query = conductorSearchQuery.toLowerCase();
    return conductors.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.badge_number?.toLowerCase().includes(query)
    );
  }, [conductorSearchQuery, conductors]);

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
    setDriverSearchQuery('');
    setConductorSearchQuery('');
    setShowDriverSuggestions(false);
    setShowConductorSuggestions(false);
    setDriverSelectedIndex(-1);
    setConductorSelectedIndex(-1);
    setEditDriver(false);
    setEditConductor(false);
  };

  const handleDriverKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDriverSuggestions || filteredDrivers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setDriverSelectedIndex((prev) => (prev < filteredDrivers.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setDriverSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (driverSelectedIndex >= 0 && filteredDrivers[driverSelectedIndex]) {
          handleSelectDriver(filteredDrivers[driverSelectedIndex].crew_id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDriverSuggestions(false);
        setDriverSelectedIndex(-1);
        break;
    }
  };

  const handleConductorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showConductorSuggestions || filteredConductors.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setConductorSelectedIndex((prev) => (prev < filteredConductors.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setConductorSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (conductorSelectedIndex >= 0 && filteredConductors[conductorSelectedIndex]) {
          handleSelectConductor(filteredConductors[conductorSelectedIndex].crew_id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowConductorSuggestions(false);
        setConductorSelectedIndex(-1);
        break;
    }
  };

  const handleSelectDriver = (crewId: string) => {
    const driver = crews.find((c) => c.crew_id === crewId);
    if (driver) {
      setSelectedDriverId(crewId);
      setDriverSearchQuery(driver.name);
      setShowDriverSuggestions(false);
      setDriverSelectedIndex(-1);
      setEditDriver(false);
    }
  };

  const handleSelectConductor = (crewId: string) => {
    const conductor = crews.find((c) => c.crew_id === crewId);
    if (conductor) {
      setSelectedConductorId(crewId);
      setConductorSearchQuery(conductor.name);
      setShowConductorSuggestions(false);
      setConductorSelectedIndex(-1);
      setEditConductor(false);
    }
  };

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDriverSearchQuery(newValue);
    setShowDriverSuggestions(true);
    setDriverSelectedIndex(-1);
    
    const selectedDriver = crews.find((c) => c.crew_id === selectedDriverId);
    if (selectedDriver && newValue !== selectedDriver.name) {
      setSelectedDriverId('');
    }
  };

  const handleConductorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setConductorSearchQuery(newValue);
    setShowConductorSuggestions(true);
    setConductorSelectedIndex(-1);
    
    const selectedConductor = crews.find((c) => c.crew_id === selectedConductorId);
    if (selectedConductor && newValue !== selectedConductor.name) {
      setSelectedConductorId('');
    }
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
                <div className="relative">
                  <Input
                    ref={driverInputRef}
                    value={driverSearchQuery}
                    onChange={handleDriverInputChange}
                    onKeyDown={handleDriverKeyDown}
                    onFocus={() => setShowDriverSuggestions(true)}
                    placeholder="Type to search driver..."
                    className="w-full"
                  />
                  
                  {showDriverSuggestions && driverSearchQuery && filteredDrivers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredDrivers.map((driver, index) => (
                        <div
                          key={driver.crew_id}
                          className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                            index === driverSelectedIndex
                              ? 'bg-purple-50 text-purple-900'
                              : 'hover:bg-gray-50'
                          } ${
                            driver.crew_id === selectedDriverId
                              ? 'bg-purple-100'
                              : ''
                          }`}
                          onClick={() => handleSelectDriver(driver.crew_id)}
                          onMouseEnter={() => setDriverSelectedIndex(index)}
                        >
                          <span className="text-sm">
                            {driver.name} {driver.badge_number ? `(${driver.badge_number})` : ''}
                          </span>
                          {driver.crew_id === selectedDriverId && (
                            <CheckIcon className="w-4 h-4 text-purple-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showDriverSuggestions && driverSearchQuery && filteredDrivers.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <p className="text-sm text-gray-500">No drivers found</p>
                    </div>
                  )}

                  {selectedDriverId && crews.find(c => c.crew_id === selectedDriverId) && (
                    <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
                      <CheckIcon className="w-4 h-4" />
                      <span>Selected: {crews.find(c => c.crew_id === selectedDriverId)?.name}</span>
                    </div>
                  )}
                </div>
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
                <div className="relative">
                  <Input
                    ref={conductorInputRef}
                    value={conductorSearchQuery}
                    onChange={handleConductorInputChange}
                    onKeyDown={handleConductorKeyDown}
                    onFocus={() => setShowConductorSuggestions(true)}
                    placeholder="Type to search conductor..."
                    className="w-full"
                  />
                  
                  {showConductorSuggestions && conductorSearchQuery && filteredConductors.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredConductors.map((conductor, index) => (
                        <div
                          key={conductor.crew_id}
                          className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                            index === conductorSelectedIndex
                              ? 'bg-purple-50 text-purple-900'
                              : 'hover:bg-gray-50'
                          } ${
                            conductor.crew_id === selectedConductorId
                              ? 'bg-purple-100'
                              : ''
                          }`}
                          onClick={() => handleSelectConductor(conductor.crew_id)}
                          onMouseEnter={() => setConductorSelectedIndex(index)}
                        >
                          <span className="text-sm">
                            {conductor.name} {conductor.badge_number ? `(${conductor.badge_number})` : ''}
                          </span>
                          {conductor.crew_id === selectedConductorId && (
                            <CheckIcon className="w-4 h-4 text-purple-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showConductorSuggestions && conductorSearchQuery && filteredConductors.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <p className="text-sm text-gray-500">No conductors found</p>
                    </div>
                  )}

                  {selectedConductorId && crews.find(c => c.crew_id === selectedConductorId) && (
                    <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
                      <CheckIcon className="w-4 h-4" />
                      <span>Selected: {crews.find(c => c.crew_id === selectedConductorId)?.name}</span>
                    </div>
                  )}
                </div>
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
