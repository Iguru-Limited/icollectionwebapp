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
  const getBadgeExpiryInfo = () => {
    if (!crew.badge_expiry) return { text: '-', expired: false, className: '' };
    
    const expiryDate = new Date(crew.badge_expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        text: `Expired ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`,
        expired: true,
        className: 'text-red-600 font-semibold'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Expires today',
        expired: true,
        className: 'text-red-600 font-semibold'
      };
    } else {
      return {
        text: `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`,
        expired: false,
        className: ''
      };
    }
  };

  const expiryInfo = getBadgeExpiryInfo();

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
            value={expiryInfo.text}
            valueClassName={expiryInfo.className}
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
