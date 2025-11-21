"use client";
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useState, useMemo } from 'react';
import { useCrews } from '@/hooks/crew/useCrews';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import type { Crew } from '@/types/crew';

export default function CrewSearchPage() {
  const [q, setQ] = useState('');
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; crew: Crew | null }>({
    open: false,
    crew: null,
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  
  // Hydrate template from session if not in store
  if (!template && session?.company_template) {
    setTemplate(session.company_template);
  }

  const { data: crewsData, isLoading: crewsLoading } = useCrews();
  const crews = crewsData?.data || [];
  const vehicles = template?.vehicles || [];

  // Filter crews by search query
  const filteredCrews = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return crews.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.badge_number?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.role_name?.toLowerCase().includes(query)
    );
  }, [q, crews]);

  // Filter vehicles by search query in dialog
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchQuery) return vehicles;
    const query = vehicleSearchQuery.toLowerCase();
    return vehicles.filter(v => 
      v.number_plate.toLowerCase().includes(query)
    );
  }, [vehicleSearchQuery, vehicles]);

  const assignMutation = useAssignVehicle({
    onSuccess: () => {
      toast.success('Vehicle assigned successfully');
      handleDialogClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign vehicle');
    },
  });

  const handleAssign = () => {
    if (!assignDialog.crew || !selectedVehicleId) {
      toast.error('Select a vehicle');
      return;
    }

    assignMutation.mutate({
      crew_id: Number(assignDialog.crew.crew_id),
      vehicle_id: Number(selectedVehicleId),
    });
  };

  const handleDialogClose = () => {
    setAssignDialog({ open: false, crew: null });
    setSelectedVehicleId('');
    setVehicleSearchQuery('');
  };

  const openAssignDialog = (crew: Crew) => {
    setAssignDialog({ open: true, crew });
  };

  return (
    <PageContainer>
      <PageHeader title="Search crew" />
      <main className="px-4 pb-24 max-w-md mx-auto space-y-6">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search by name, badge, phone, or role..."
        />
        
        {crewsLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!crewsLoading && q && filteredCrews.length === 0 && (
          <div className="text-center text-gray-500 py-12">No crew members found</div>
        )}

        {!crewsLoading && filteredCrews.length > 0 && (
          <div className="space-y-3">
            {filteredCrews.map((crew) => (
              <Card
                key={crew.crew_id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openAssignDialog(crew)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-purple-100 text-purple-700 font-semibold">
                    {crew.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{crew.name}</div>
                    <div className="text-sm text-gray-600">
                      {crew.role_name || 'N/A'} • {crew.badge_number || 'No badge'}
                    </div>
                    {crew.vehicle_plate && (
                      <Badge variant="outline" className="mt-1">
                        {crew.vehicle_plate}
                      </Badge>
                    )}
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
              Assign Vehicle to {assignDialog.crew?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-600">
              Role: {assignDialog.crew?.role_name || 'N/A'}
              {assignDialog.crew?.badge_number && ` • Badge: ${assignDialog.crew.badge_number}`}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Select Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicle-select">
                  <SelectValue placeholder="Choose a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-1">
                    <Input
                      autoFocus
                      value={vehicleSearchQuery}
                      onChange={(e) => setVehicleSearchQuery(e.target.value)}
                      placeholder="Type to search vehicle..."
                      className="h-9"
                    />
                  </div>
                  {filteredVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.vehicle_id} value={String(vehicle.vehicle_id)}>
                      {vehicle.number_plate}
                    </SelectItem>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">
                      {vehicleSearchQuery ? 'No matching vehicles found' : 'No vehicles available'}
                    </div>
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
              disabled={assignMutation.isPending || !selectedVehicleId}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
