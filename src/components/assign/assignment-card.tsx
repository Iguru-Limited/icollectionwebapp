import { THEME_COLORS } from '@/lib/utils/constants';

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

export function AssignmentCard({ assignment, crewName, crewRole, vehiclePlate }: AssignmentCardProps) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: THEME_COLORS.SURFACE }}>
      <div className="text-sm" style={{ color: THEME_COLORS.TEXT }}>
        {crewName ?? '—'} → {vehiclePlate ?? '—'}
      </div>
      <div className="text-xs" style={{ color: THEME_COLORS.TEXT_LIGHT }}>
        {crewRole ?? ''}
      </div>
    </div>
  );
}
