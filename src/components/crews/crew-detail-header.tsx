import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Crew } from '@/types/crew';

interface CrewDetailHeaderProps {
  crew: Crew;
  active: 'bio' | 'actions' | 'history';
  onSelect: (key: 'bio' | 'actions' | 'history') => void;
}

export function CrewDetailHeader({ crew, active, onSelect }: CrewDetailHeaderProps) {
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 1) || 'C';

  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-28 w-28 mb-4">
        <AvatarFallback className="text-3xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
      </Avatar>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">{crew.name}</div>
        <div className="mt-2">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">{crew.role_name}</Badge>
        </div>
      </div>

      <div className="mt-6 w-full max-w-xs flex justify-center">
        <Button
          onClick={() => onSelect('bio')}
          className={`rounded-2xl px-8 w-40 bg-purple-700 hover:bg-purple-800 text-white`}
        >
          Bio data
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
        <Button
          onClick={() => onSelect('actions')}
          className="rounded-2xl bg-purple-700 hover:bg-purple-800 text-white"
        >
          Actions
        </Button>
        <Button
          onClick={() => onSelect('history')}
          className="rounded-2xl bg-purple-700 hover:bg-purple-800 text-white"
        >
          History
        </Button>
      </div>
    </div>
  );
}
