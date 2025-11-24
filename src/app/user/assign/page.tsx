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
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import type { Crew } from '@/types/crew';
import { toast } from 'sonner';

interface SimpleVehicle { vehicle_id: number; number_plate: string }

export default function AssignPage() {
  const template = useCompanyTemplateStore((s) => s.template);
  // Template is already persisted from login in Zustand + localStorage

  // Crews hook
  const { data: crewsResponse, isLoading: crewsLoading, error: crewsError } = useCrews();
  const crews: Crew[] = crewsResponse?.data ?? [];

  const vehicles: SimpleVehicle[] = (template?.vehicles ?? []).map(v => ({
    vehicle_id: v.vehicle_id,
    number_plate: v.number_plate,
  }));

  // Get drivers and conductors
  const drivers = crews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  const conductors = crews.filter(c => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');

  // Form state
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);

  const [driverQuery, setDriverQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverMenuOpen, setDriverMenuOpen] = useState(false);

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
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Filtering logic
  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) return [];
    return vehicles.filter(v => v.number_plate.toLowerCase().includes(q)).slice(0, 8);
  }, [vehicleQuery, vehicles]);

  const filteredDrivers = useMemo(() => {
    const q = driverQuery.trim().toLowerCase();
    if (!q) return [];
    return drivers.filter(c => c.name.toLowerCase().includes(q) || c.badge_number?.toLowerCase().includes(q)).slice(0, 8);
  }, [driverQuery, drivers]);

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
                }}
                onFocus={() => setVehicleMenuOpen(true)}
                onBlur={() => setTimeout(() => setVehicleMenuOpen(false), 120)}
                placeholder="search by name"
                className="h-12 rounded-md border-gray-300"
              />
              {vehicleMenuOpen && vehicleQuery && filteredVehicles.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredVehicles.map(v => (
                    <li
                      key={v.vehicle_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedVehicleId(v.vehicle_id);
                        setVehicleQuery(v.number_plate);
                        setVehicleMenuOpen(false);
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
            <div className="text-sm font-medium text-gray-700">select Driver</div>
            <div className="relative">
              <Input
                value={driverQuery}
                onChange={(e) => {
                  setDriverQuery(e.target.value);
                  setSelectedDriverId('');
                  setDriverMenuOpen(true);
                }}
                onFocus={() => setDriverMenuOpen(true)}
                onBlur={() => setTimeout(() => setDriverMenuOpen(false), 120)}
                placeholder="search by name"
                className="h-12 rounded-md border-gray-300"
              />
              {driverMenuOpen && driverQuery && filteredDrivers.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredDrivers.map(c => (
                    <li
                      key={c.crew_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedDriverId(c.crew_id);
                        setDriverQuery(c.name);
                        setDriverMenuOpen(false);
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-400 text-xs uppercase">{c.badge_number}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Conductor Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">select Conductor</div>
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
                className="h-12 rounded-md border-gray-300"
              />
              {conductorMenuOpen && conductorQuery && filteredConductors.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredConductors.map(c => (
                    <li
                      key={c.crew_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedConductorId(c.crew_id);
                        setConductorQuery(c.name);
                        setConductorMenuOpen(false);
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-400 text-xs uppercase">{c.badge_number}</span>
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
        {crewsError && (
          <div className="text-xs text-red-600 mt-4">Failed to load crews: {crewsError.message}</div>
        )}
        {crewsLoading && (
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