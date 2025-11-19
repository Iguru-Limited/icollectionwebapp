import { Assignment, AssignmentCard } from './assignment-card';
import { Crew, Vehicle } from './assignment-form';

interface AssignmentListProps {
  assignments: Assignment[];
  crews: Crew[];
  vehicles: Vehicle[];
}

export function AssignmentList({ assignments, crews, vehicles }: AssignmentListProps) {
  return (
    <section>
      <h2 className="text-sm mb-2 text-gray-900 font-medium">
        Recent Assignments
      </h2>
      <ul className="space-y-2">
        {assignments.map((a) => {
          const crew = crews.find((c) => c.id === a.crewId);
          const vehicle = vehicles.find((v) => v.id === a.vehicleId);
          
          return (
            <li key={a.id}>
              <AssignmentCard
                assignment={a}
                crewName={crew?.name}
                crewRole={crew?.role}
                vehiclePlate={vehicle?.plate}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
