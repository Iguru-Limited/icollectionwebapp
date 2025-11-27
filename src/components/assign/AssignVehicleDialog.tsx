'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AutocompleteInput, type AutocompleteOption } from '@/components/ui/autocomplete-input';
import type { Crew } from '@/types/crew';
import { Badge } from '@/components/ui/badge';

interface Vehicle {
  vehicle_id: number | string;
  number_plate: string;
  type_name?: string;
}

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crew: Crew | null;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function AssignVehicleDialog({
  open,
  onOpenChange,
  crew,
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  onConfirm,
  loading = false,
}: AssignVehicleDialogProps) {
  const isCrewActive = crew?.active === '1';
  
  const vehicleOptions: AutocompleteOption[] = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: String(vehicle.vehicle_id),
        label: vehicle.number_plate,
        subtitle: vehicle.type_name,
      })),
    [vehicles]
  );

  const handleConfirm = () => {
    if (!isCrewActive) {
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
          {crew && !isCrewActive && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
              <p className="text-sm text-red-800">This crew member is inactive and cannot be assigned to a vehicle.</p>
            </div>
          )}
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {crew ? (
              <>
                <span>
                  {crew.name} {crew.role_name ? `(${crew.role_name})` : ''}
                </span>
                {crew.active !== '1' && (
                  <Badge variant="destructive" className="text-xs">Inactive</Badge>
                )}
              </>
            ) : (
              'No crew selected'
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-search">Select Vehicle</Label>
            <AutocompleteInput
              options={vehicleOptions}
              value={selectedVehicleId}
              onValueChange={onVehicleChange}
              placeholder="Type to search vehicle..."
              disabled={loading || !isCrewActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || !selectedVehicleId || !isCrewActive}
          >
            {loading ? 'Assigning...' : !isCrewActive ? 'Crew Inactive - Cannot Assign' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
