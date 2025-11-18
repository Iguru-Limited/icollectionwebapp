import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { THEME_COLORS } from '@/lib/utils/constants';

export interface Crew {
  id: string;
  name: string;
  role: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
}

interface AssignmentFormProps {
  crews: Crew[];
  vehicles: Vehicle[];
  onAssign: (crewId: string, vehicleId: string) => Promise<void>;
}

export function AssignmentForm({ crews, vehicles, onAssign }: AssignmentFormProps) {
  const [crewId, setCrewId] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!crewId || !vehicleId) return;
    
    setSaving(true);
    try {
      await onAssign(crewId, vehicleId);
      setCrewId('');
      setVehicleId('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-4" style={{ backgroundColor: THEME_COLORS.SURFACE }}>
      <div className="space-y-1">
        <Label className="text-xs">Crew</Label>
        <Select value={crewId} onValueChange={setCrewId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select crew" />
          </SelectTrigger>
          <SelectContent>
            {crews.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Vehicle</Label>
        <Select value={vehicleId} onValueChange={setVehicleId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.plate} ({v.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={saving || !crewId || !vehicleId}>
        Create Assignment
      </Button>
    </form>
  );
}
