import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { Crew } from '@/types/crew';

interface CrewCardProps {
  crew: Crew;
}

export function CrewCard({ crew }: CrewCardProps) {
  const expired = crew.badge_expiry ? new Date(crew.badge_expiry) < new Date() : false;
  const expiryStr = crew.badge_expiry ? new Date(crew.badge_expiry).toLocaleDateString() : '-';
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';
  const completionPercentage = crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0;

  return (
    <Link href={`/user/crews/${crew.crew_id}`}>
      <Card className="flex items-center gap-3 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
          </Avatar>
          {/* Profile Completion Badge */}
          <div className="absolute -bottom-1 -right-1 text-black text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {completionPercentage}%
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-gray-900">
            {crew.name}
          </div>
          <div className="text-xs text-gray-500">
            {crew.role_name}
          </div>
          {crew.phone && (
            <div className="text-xs text-gray-400 mt-0.5">
              {crew.phone}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Badge No.</div>
          <div className="text-sm font-medium text-gray-900">
            {crew.badge_number ?? '-'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Expiry</div>
          <div className={`text-sm font-medium ${expired ? 'text-red-600' : 'text-gray-900'}`}>
            {expiryStr}
          </div>
        </div>
      </Card>
    </Link>
  );
}
