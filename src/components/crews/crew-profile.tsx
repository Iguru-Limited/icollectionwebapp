import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import type { Crew } from '@/types/crew';

interface CrewProfileProps {
  crew: Crew;
}

export function CrewProfile({ crew }: CrewProfileProps) {
  const expired = crew.badge_expiry ? new Date(crew.badge_expiry) < new Date() : false;
  const expiryStr = crew.badge_expiry ? new Date(crew.badge_expiry).toLocaleDateString() : '-';
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';
  const completionPercentage = crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
              </Avatar>
              {/* Profile Completion Badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[11px] font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                {completionPercentage}%
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {crew.name}
            </h2>
            <Badge variant="secondary" className="mb-3">
              {crew.role_name}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow 
            icon={<PhoneIcon className="h-4 w-4" />}
            label="Phone" 
            value={crew.phone ?? '-'} 
          />
          <InfoRow 
            icon={<EnvelopeIcon className="h-4 w-4" />}
            label="Email" 
            value={crew.email ?? '-'} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow 
            icon={<UserIcon className="h-4 w-4" />}
            label="Employee No." 
            value={crew.employee_no ?? '-'} 
          />
          <InfoRow 
            icon={<IdentificationIcon className="h-4 w-4" />}
            label="ID Number" 
            value={crew.id_number ?? '-'} 
          />
          <InfoRow 
            icon={<CreditCardIcon className="h-4 w-4" />}
            label="Badge No." 
            value={crew.badge_number ?? '-'} 
          />
          <InfoRow 
            icon={<CalendarDaysIcon className="h-4 w-4" />}
            label="Badge Expiry" 
            value={expiryStr}
            valueClassName={expired ? 'text-red-600 font-semibold' : ''}
          />
        </CardContent>
      </Card>

      <Link href={`/user/crews/${crew.crew_id}/edit`}>
        <Button className="w-full">Edit Crew</Button>
      </Link>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName = '' }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`text-sm font-medium text-gray-900 ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
