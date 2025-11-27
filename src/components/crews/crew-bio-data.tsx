import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  UserIcon,
  IdentificationIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  RectangleStackIcon,
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
            <InfoRow
              icon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
              label="National ID"
              value={crew.id_number ?? '-'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status & Assignment Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Status & Assignment</h3>
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <InfoRow
              icon={<RectangleStackIcon className="h-5 w-5 text-gray-400" />}
              label="Role"
              value={crew.role_name ?? '-'}
            />
            <InfoRow
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              label="Status"
              value={isActive ? 'Active' : 'Inactive'}
              valueClassName={isActive ? 'text-green-600' : 'text-red-600'}
            />
            <InfoRow
              icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              label="Profile Completion"
              value={`${crew.profile_completion_percentage || '0'}%`}
            />
            <InfoRow
              icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>}
              label="Created"
              value={crew.created_at ? new Date(crew.created_at).toLocaleDateString() : '-'}
            />
            <InfoRow
              icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>}
              label="Updated"
              value={crew.updated_at ? new Date(crew.updated_at).toLocaleDateString() : '-'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Assignment Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Vehicle Assignment</h3>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            {crew.vehicle_id ? (
              <div className="space-y-4">
                <InfoRow
                  icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h2l2 7h10l2-7h2M5 13l4-8h6l4 8M8 21h8" />
                  </svg>}
                  label="Plate Number"
                  value={crew.vehicle_plate ?? '-'}
                />
                <InfoRow
                  icon={<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>}
                  label="Vehicle Type"
                  value={crew.vehicle_type_name ?? '-'}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">Not Assigned to Any Vehicle</p>
              </div>
            )}
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
