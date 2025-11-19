import { Card } from '@/components/ui/card';

export interface Assignment {
  id: string;
  crewId: string;
  vehicleId: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  crewName?: string;
  crewRole?: string;
  vehiclePlate?: string;
}

export function AssignmentCard({ crewName, crewRole, vehiclePlate }: AssignmentCardProps) {
  return (
    <Card className="rounded-xl p-3">
      <div className="text-sm text-gray-900">
        {crewName ?? '—'} → {vehiclePlate ?? '—'}
      </div>
      <div className="text-xs text-gray-500">
        {crewRole ?? ''}
      </div>
    </Card>
  );
}
