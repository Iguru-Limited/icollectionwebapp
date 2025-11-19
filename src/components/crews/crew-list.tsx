import type { Crew } from '@/types/crew';
import { CrewCard } from './crew-card';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

interface CrewListProps {
  crews: Crew[];
  isLoading?: boolean;
}

export function CrewList({ crews, isLoading }: CrewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No crew members found</EmptyTitle>
          <EmptyDescription>Try adjusting your search or filter criteria</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {crews.map((crew) => (
        <CrewCard key={crew.crew_id} crew={crew} />
      ))}
    </div>
  );
}
