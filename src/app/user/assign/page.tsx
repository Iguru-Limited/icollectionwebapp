"use client";
import { useState, useMemo } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useCrews } from '@/hooks/crew';
import { useAssignVehicle } from '@/hooks/crew';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { XMarkIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Crew } from '@/types/crew';
import { toast } from 'sonner';

interface SimpleVehicle { vehicle_id: number | string; number_plate: string; fleet_number?: string | null; crew?: { crew_id: string; crew_role_id: string; name: string }[] }

export default function AssignPage() {
  const template = useCompanyTemplateStore((s) => s.template);
  // Template may be used as fallback if vehicles endpoint empty.

  // Fetch live crews & vehicles (vehicles include current assignments)
  const { data: crewsResponse, isLoading: crewsLoading, error: crewsError } = useCrews();
  const { data: vehiclesResponse, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const crews: Crew[] = crewsResponse?.data ?? [];

  // Prefer vehicles from API, fallback to template (which may not have crew info)
  const vehicles: SimpleVehicle[] = useMemo(() => {
    if (vehiclesResponse?.data && vehiclesResponse.data.length > 0) {
      return vehiclesResponse.data as SimpleVehicle[];
    }
    // Fallback mapping (template vehicles may not include crew info)
    return (template?.vehicles ?? []).map(v => ({
      vehicle_id: v.vehicle_id,
      number_plate: v.number_plate,
      crew: undefined,
    })) as SimpleVehicle[];
  }, [vehiclesResponse?.data, template?.vehicles]);

  // Get drivers and conductors (only active ones)
  const drivers = crews.filter(c => (c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER') && c.active === '1');
  const conductors = crews.filter(c => (c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR') && c.active === '1');

  // Form state
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [currentVehicleCrew, setCurrentVehicleCrew] = useState<{ driver?: { crew_id: string; name: string }; conductor?: { crew_id: string; name: string } } | null>(null);

  const [driverQuery, setDriverQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverMenuOpen, setDriverMenuOpen] = useState(false);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  const [conductorQuery, setConductorQuery] = useState('');
  const [selectedConductorId, setSelectedConductorId] = useState<string>('');
  const [conductorMenuOpen, setConductorMenuOpen] = useState(false);

  // Conflict dialog state
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({
    open: false,
    error: '',
    message: '',
    pendingIds: [],
  });

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast.success(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      // Reset form
      setSelectedVehicleId(null);
      setVehicleQuery('');
      setSelectedDriverId('');
      setDriverQuery('');
      setSelectedConductorId('');
      setConductorQuery('');
      setCurrentVehicleCrew(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
  });

  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast.info(data.message || 'Pending assignment request cancelled');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (err) => {
      toast.error(err.message);
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
  });

  const { mutateAsync: assignVehicle, isPending } = useAssignVehicle({
    onSuccess: (data) => {
      console.log('Assignment response:', data);
      // Check if there's a conflict
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictDialog({
          open: true,
          error: data.error || '',
          message: data.message || '',
          pendingIds: data.pending_assignment_ids,
        });
        return;
      }
      
      toast.success(data.message || 'Assignment successful');
      // Reset form
      setSelectedVehicleId(null);
      setVehicleQuery('');
      setSelectedDriverId('');
      setDriverQuery('');
      setSelectedConductorId('');
      setConductorQuery('');
      setCurrentVehicleCrew(null);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Filtering logic
  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) {
      return showAllVehicles ? vehicles.slice(0, 8) : [];
    }
    return vehicles.filter(v => v.number_plate.toLowerCase().includes(q) || (v.fleet_number || '').toLowerCase().includes(q)).slice(0, 8);
  }, [vehicleQuery, vehicles, showAllVehicles]);

  const filteredDrivers = useMemo(() => {
    const q = driverQuery.trim().toLowerCase();
    if (!q) {
      return showAllDrivers ? drivers.slice(0, 8) : [];
    }
    return drivers.filter(c => c.name.toLowerCase().includes(q) || c.badge_number?.toLowerCase().includes(q)).slice(0, 8);
  }, [driverQuery, drivers, showAllDrivers]);

  const filteredConductors = useMemo(() => {
    const q = conductorQuery.trim().toLowerCase();
    if (!q) return [];
    return conductors.filter(c => c.name.toLowerCase().includes(q) || c.badge_number?.toLowerCase().includes(q)).slice(0, 8);
  }, [conductorQuery, conductors]);

  async function handleAssign() {
    const crewIds = [selectedDriverId, selectedConductorId].filter(Boolean);
    if (!selectedVehicleId || crewIds.length === 0) {
      toast.error('Select vehicle and at least one crew member');
      return;
    }
    
    // Validate that selected crew members are active
    const selectedDriver = selectedDriverId ? crews.find(c => c.crew_id === selectedDriverId) : null;
    const selectedConductor = selectedConductorId ? crews.find(c => c.crew_id === selectedConductorId) : null;
    
    if (selectedDriver && selectedDriver.active !== '1') {
      toast.error(`Cannot assign inactive driver: ${selectedDriver.name}`);
      return;
    }
    if (selectedConductor && selectedConductor.active !== '1') {
      toast.error(`Cannot assign inactive conductor: ${selectedConductor.name}`);
      return;
    }
    
    const crewIdPayload = crewIds.length === 1 ? Number(crewIds[0]) : crewIds.map(id => Number(id));
    await assignVehicle({ vehicle_id: selectedVehicleId, crew_id: crewIdPayload });
  }

  return (
    <PageContainer>
      <PageHeader title="Assign vehicle" />
      <main className="px-4 pb-24 max-w-md mx-auto">
        <Card className="p-6 rounded-2xl space-y-6 border-2 border-white-500">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">select vehicle</div>
            <div className="relative">
              <Input
                value={vehicleQuery}
                onChange={(e) => {
                  setVehicleQuery(e.target.value);
                  setSelectedVehicleId(null);
                  setVehicleMenuOpen(true);
                  setShowAllVehicles(false);
                }}
                onFocus={() => { setVehicleMenuOpen(true); }}
                onBlur={() => setTimeout(() => setVehicleMenuOpen(false), 120)}
                placeholder="search by plate or fleet number"
                className="h-12 rounded-md border-gray-300 pr-12"
              />
              <button
                type="button"
                aria-label="Search vehicles"
                onClick={() => { setVehicleMenuOpen(true); setShowAllVehicles(true); setVehicleQuery(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-100 text-purple-600 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              {vehicleMenuOpen && ((vehicleQuery && filteredVehicles.length > 0) || (showAllVehicles && filteredVehicles.length > 0)) && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredVehicles.map(v => (
                    <li
                      key={v.vehicle_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedVehicleId(typeof v.vehicle_id === 'string' ? Number(v.vehicle_id) : v.vehicle_id as number);
                          setVehicleQuery(v.number_plate);
                          setVehicleMenuOpen(false);
                          setShowAllVehicles(false);
                          // Load current crew for this vehicle (from live data)
                          const driver = v.crew?.find(c => c.crew_role_id === '3');
                          const conductor = v.crew?.find(c => c.crew_role_id === '12');
                          setCurrentVehicleCrew({
                            driver: driver ? { crew_id: driver.crew_id, name: driver.name || '' } : undefined,
                            conductor: conductor ? { crew_id: conductor.crew_id, name: conductor.name || '' } : undefined,
                          });
                          // Prefill fields if crew exists; otherwise clear
                          if (driver) {
                            setDriverQuery(driver.name || '');
                            setSelectedDriverId(driver.crew_id);
                          } else {
                            setDriverQuery('');
                            setSelectedDriverId('');
                          }
                          if (conductor) {
                            setConductorQuery(conductor.name || '');
                            setSelectedConductorId(conductor.crew_id);
                          } else {
                            setConductorQuery('');
                            setSelectedConductorId('');
                          }
                        }}
                    >
                      <span className="font-medium uppercase">{v.number_plate}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Driver Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Driver</div>
            <div className="relative">
              <Input
                value={driverQuery}
                onChange={(e) => {
                  setDriverQuery(e.target.value);
                  setSelectedDriverId('');
                  setDriverMenuOpen(true);
                  setShowAllDrivers(false);
                }}
                onFocus={() => setDriverMenuOpen(true)}
                onBlur={() => setTimeout(() => setDriverMenuOpen(false), 120)}
                placeholder="search by name"
                className="h-12 rounded-md border-gray-300 pr-28"
              />
              
              {currentVehicleCrew?.driver && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDriverQuery('');
                      setSelectedDriverId('');
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 text-red-600"
                    title="Unassign driver"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDriverQuery('');
                      setSelectedDriverId('');
                      setDriverMenuOpen(true);
                      setShowAllDrivers(true);
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 text-purple-600"
                    title="Change driver"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              {driverMenuOpen && driverQuery && filteredDrivers.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredDrivers.map(c => (
                    <li
                      key={c.crew_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center gap-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedDriverId(c.crew_id);
                        setDriverQuery(c.name);
                        setDriverMenuOpen(false);
                        setCurrentVehicleCrew(prev => ({ ...(prev || {}), driver: { crew_id: c.crew_id, name: c.name } }));
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-2">
                        {c.active !== '1' && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Inactive</span>
                        )}
                        <span className="text-gray-400 text-xs uppercase">{c.badge_number}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Conductor Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Conductor</div>
            <div className="relative">
              <Input
                value={conductorQuery}
                onChange={(e) => {
                  setConductorQuery(e.target.value);
                  setSelectedConductorId('');
                  setConductorMenuOpen(true);
                }}
                onFocus={() => setConductorMenuOpen(true)}
                onBlur={() => setTimeout(() => setConductorMenuOpen(false), 120)}
                placeholder="search by name"
                className="h-12 rounded-md border-gray-300 pr-20"
              />
              {currentVehicleCrew?.conductor && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConductorQuery('');
                      setSelectedConductorId('');
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 text-red-600"
                    title="Unassign conductor"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConductorQuery('');
                      setSelectedConductorId('');
                      setConductorMenuOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 text-purple-600"
                    title="Change conductor"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              {conductorMenuOpen && conductorQuery && filteredConductors.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredConductors.map(c => (
                    <li
                      key={c.crew_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center gap-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedConductorId(c.crew_id);
                        setConductorQuery(c.name);
                        setConductorMenuOpen(false);
                        setCurrentVehicleCrew(prev => ({ ...(prev || {}), conductor: { crew_id: c.crew_id, name: c.name } }));
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-2">
                        {c.active !== '1' && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Inactive</span>
                        )}
                        <span className="text-gray-400 text-xs uppercase">{c.badge_number}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Assign Button */}
          <div className="pt-4">
            <Button
              type="button"
              disabled={isPending || !selectedVehicleId || (!selectedDriverId && !selectedConductorId)}
              onClick={handleAssign}
              className="w-full h-14 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-lg font-medium"
            >
              {isPending ? <Spinner className="w-5 h-5" /> : 'Assign'}
            </Button>
          </div>
        </Card>
        {(crewsError || vehiclesError) && (
          <div className="text-xs text-red-600 mt-4">
            {crewsError && <span>Failed to load crews: {crewsError.message}. </span>}
            {vehiclesError && <span>Failed to load vehicles: {vehiclesError.message}</span>}
          </div>
        )}
        {(crewsLoading || vehiclesLoading) && (
          <div className="mt-4 flex justify-center"><Spinner className="w-5 h-5" /></div>
        )}
      </main>

      {/* Conflict Dialog */}
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