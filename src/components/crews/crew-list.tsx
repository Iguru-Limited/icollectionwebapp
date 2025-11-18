import { Crew, CrewCard } from './crew-card';

interface CrewListProps {
  crews: Crew[];
}

export function CrewList({ crews }: CrewListProps) {
  return (
    <ul className="space-y-2">
      {crews.map((crew) => (
        <li key={crew.id}>
          <CrewCard crew={crew} />
        </li>
      ))}
    </ul>
  );
}
