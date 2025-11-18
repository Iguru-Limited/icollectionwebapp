import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { THEME_COLORS } from '@/lib/utils/constants';
import { Crew } from './crew-card';

interface CrewProfileProps {
  crew: Crew;
}

export function CrewProfile({ crew }: CrewProfileProps) {
  const expired = crew.badgeExpiry ? new Date(crew.badgeExpiry) < new Date() : false;
  const expiryStr = crew.badgeExpiry ? new Date(crew.badgeExpiry).toLocaleDateString() : '-';
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: THEME_COLORS.SURFACE }}>
        <Avatar className="h-20 w-20 mx-auto mb-3">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-base font-semibold mb-1" style={{ color: THEME_COLORS.TEXT }}>
          {crew.name}
        </div>
        <div className="text-sm" style={{ color: THEME_COLORS.TEXT_LIGHT }}>
          {crew.role}
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: THEME_COLORS.SURFACE }}>
        <InfoRow label="Phone" value={crew.phone ?? '-'} />
        <InfoRow label="Employee No." value={crew.employeeNo ?? '-'} />
        <InfoRow label="Badge No." value={crew.badgeNo ?? '-'} />
        <InfoRow 
          label="Badge Expiry" 
          value={expiryStr}
          valueColor={expired ? THEME_COLORS.ACCENT : THEME_COLORS.TEXT}
          valueClassName={expired ? 'font-semibold' : ''}
        />
      </div>

      <Link href={`/user/crews/${crew.id}/edit`}>
        <Button className="w-full">Edit Crew</Button>
      </Link>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  valueClassName?: string;
}

function InfoRow({ label, value, valueColor, valueClassName = '' }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: THEME_COLORS.TEXT_LIGHT }}>
        {label}
      </span>
      <span 
        className={`text-sm ${valueClassName}`}
        style={{ color: valueColor ?? THEME_COLORS.TEXT }}
      >
        {value}
      </span>
    </div>
  );
}
