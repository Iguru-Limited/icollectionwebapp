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

  const completionPercentage = crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <Avatar className="h-28 w-28">
          <AvatarFallback className="text-3xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
        </Avatar>
        {/* Profile Completion Badge */}
        <div className="absolute -bottom-1 -right-1 text-black text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center">
          {completionPercentage}%
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">{crew.name}</div>
        <div className="mt-2">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">{crew.role_name}</Badge>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md grid grid-cols-3 gap-3">
        <Button
          onClick={() => onSelect('bio')}
          aria-current={active === 'bio'}
          className={`rounded-2xl px-4 py-6 text-sm font-semibold transition-colors ${active === 'bio' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
        >
          Bio data
        </Button>
        <Button
          onClick={() => onSelect('actions')}
          aria-current={active === 'actions'}
          className={`rounded-2xl px-4 py-6 text-sm font-semibold transition-colors ${active === 'actions' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
        >
          Actions
        </Button>
        <Button
          onClick={() => onSelect('history')}
          aria-current={active === 'history'}
          className={`rounded-2xl px-4 py-6 text-sm font-semibold transition-colors ${active === 'history' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
        >
          History
        </Button>
      </div>
    </div>
  );
}
