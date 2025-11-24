import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import type { Crew } from '@/types/crew';

interface CrewBioDataProps {
  crew: Crew;
}

export function CrewBioData({ crew }: CrewBioDataProps) {
  const expired = crew.badge_expiry ? new Date(crew.badge_expiry) < new Date() : false;
  const expiryStr = crew.badge_expiry ? new Date(crew.badge_expiry).toLocaleDateString() : '-';

  return (
    <div className="space-y-4">
      {/* Avatar and badge section removed to eliminate unused imports */}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<PhoneIcon className="h-4 w-4" />} label="Phone" value={crew.phone ?? '-'} />
          <InfoRow icon={<EnvelopeIcon className="h-4 w-4" />} label="Email" value={crew.email ?? '-'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Employee No." value={crew.employee_no ?? '-'} />
          <InfoRow icon={<IdentificationIcon className="h-4 w-4" />} label="ID Number" value={crew.id_number ?? '-'} />
          <InfoRow icon={<CreditCardIcon className="h-4 w-4" />} label="Badge No." value={crew.badge_number ?? '-'} />
          <InfoRow
            icon={<CalendarDaysIcon className="h-4 w-4" />}
            label="Badge Expiry"
            value={expiryStr}
            valueClassName={expired ? 'text-red-600 font-semibold' : ''}
          />
        </CardContent>
      </Card>

      {/* Removed Identifiers card per request */}
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
      <span className={`text-sm font-medium text-gray-900 ${valueClassName}`}>{value}</span>
    </div>
  );
}
