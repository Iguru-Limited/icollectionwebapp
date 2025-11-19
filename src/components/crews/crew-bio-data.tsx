import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, CreditCard, Calendar, User, IdCard } from 'lucide-react';
import type { Crew } from '@/types/crew';

interface CrewBioDataProps {
  crew: Crew;
}

export function CrewBioData({ crew }: CrewBioDataProps) {
  const expired = crew.badge_expiry ? new Date(crew.badge_expiry) < new Date() : false;
  const expiryStr = crew.badge_expiry ? new Date(crew.badge_expiry).toLocaleDateString() : '-';
  const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{crew.name}</h2>
            <Badge variant="secondary" className="mb-1">{crew.role_name}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={crew.phone ?? '-'} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={crew.email ?? '-'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<User className="h-4 w-4" />} label="Employee No." value={crew.employee_no ?? '-'} />
          <InfoRow icon={<IdCard className="h-4 w-4" />} label="ID Number" value={crew.id_number ?? '-'} />
          <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Badge No." value={crew.badge_number ?? '-'} />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Badge Expiry"
            value={expiryStr}
            valueClassName={expired ? 'text-red-600 font-semibold' : ''}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identifiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<IdCard className="h-4 w-4" />} label="Crew ID" value={crew.crew_id} />
          <InfoRow icon={<IdCard className="h-4 w-4" />} label="Role ID" value={crew.crew_role_id?.toString?.() ?? '-'} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Record Type" value={crew.type} />
        </CardContent>
      </Card>
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
