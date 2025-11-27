import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  UserIcon,
  IdentificationIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
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
  const isActive = crew.active === '1';

  return (
    <div className="space-y-4">
      {/* Edit Profile Button */}
      <Link href={`/user/crews/${crew.crew_id}/edit`}>
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-6 font-semibold">
          <PencilSquareIcon className="w-5 h-5 mr-2" />
          Edit Profile
        </Button>
      </Link>

      {/* Personal Information Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <InfoRow 
              icon={<UserIcon className="h-5 w-5 text-gray-400" />} 
              label="Full Name" 
              value={crew.name ?? '-'} 
            />
            <InfoRow 
              icon={<PhoneIcon className="h-5 w-5 text-gray-400" />} 
              label="Phone Number" 
              value={crew.phone ?? '-'} 
            />
            <InfoRow 
              icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />} 
              label="Email" 
              value={crew.email ?? '-'} 
            />
            <InfoRow 
              icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />} 
              label="Employee Number" 
              value={crew.employee_no ?? '-'} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Badge Details Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Badge Details</h3>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <InfoRow 
              icon={<CreditCardIcon className="h-5 w-5 text-gray-400" />} 
              label="Badge Number" 
              value={crew.badge_number ?? '-'} 
            />
            <InfoRow 
              icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>} 
              label="Badge Expiry" 
              value={crew.badge_expiry ? new Date(crew.badge_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
              valueClassName={expiryInfo.className}
            />
          </CardContent>
        </Card>
      </div>
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
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className={`text-sm font-medium text-gray-900 ${valueClassName}`}>{value}</div>
      </div>
    </div>
  );
}
