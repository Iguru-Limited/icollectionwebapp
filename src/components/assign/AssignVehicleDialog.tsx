'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AutocompleteInput, type AutocompleteOption } from '@/components/ui/autocomplete-input';
import type { Crew } from '@/types/crew';

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
  const vehicleOptions: AutocompleteOption[] = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: String(vehicle.vehicle_id),
        label: vehicle.number_plate,
        subtitle: vehicle.type_name,
      })),
    [vehicles]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            {crew ? (
              <span>
                {crew.name} {crew.role_name ? `(${crew.role_name})` : ''}
              </span>
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
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading || !selectedVehicleId}>
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
