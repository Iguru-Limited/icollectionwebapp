import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { THEME_COLORS } from '@/lib/utils/constants';

export interface Crew {
  id: string;
  name: string;
  role: string;
  phone?: string;
  employeeNo?: string;
  badgeNo?: string;
  badgeExpiry?: string;
  avatarUrl?: string;
}

interface CrewCardProps {
  crew: Crew;
}

export function CrewCard({ crew }: CrewCardProps) {
  const expired = crew.badgeExpiry ? new Date(crew.badgeExpiry) < new Date() : false;
  const expiryStr = crew.badgeExpiry ? new Date(crew.badgeExpiry).toLocaleDateString() : '-';
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';

  return (
    <Link 
      href={`/user/crews/${crew.id}`} 
      className="flex items-center gap-3 rounded-xl p-3" 
      style={{ backgroundColor: THEME_COLORS.SURFACE }}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: THEME_COLORS.TEXT }}>
          {crew.name}
        </div>
        <div className="text-xs" style={{ color: THEME_COLORS.TEXT_LIGHT }}>
          {crew.role}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs" style={{ color: THEME_COLORS.TEXT_LIGHT }}>Badge No.</div>
        <div className="text-sm" style={{ color: THEME_COLORS.TEXT }}>
          {crew.badgeNo ?? '-'}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs" style={{ color: THEME_COLORS.TEXT_LIGHT }}>Expiry</div>
        <div 
          className={`text-sm ${expired ? 'font-semibold' : ''}`} 
          style={{ color: expired ? THEME_COLORS.ACCENT : THEME_COLORS.TEXT }}
        >
          {expiryStr}
        </div>
      </div>
    </Link>
  );
}
