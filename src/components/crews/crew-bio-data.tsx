import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditCrew } from '@/hooks/crew';
import { toast } from 'sonner';
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
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: crew.name ?? '',
    phone: crew.phone ?? '',
    email: crew.email ?? '',
    employee_no: crew.employee_no ?? '',
    id_number: crew.id_number ?? '',
    badge_number: crew.badge_number ?? '',
    badge_expiry: crew.badge_expiry ?? '',
  });

  const editMutation = useEditCrew(crew, {
    onSuccess: (data) => {
      toast.success(data.message || 'Crew updated successfully');
      setEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update crew');
    },
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      name: crew.name ?? '',
      phone: crew.phone ?? '',
      email: crew.email ?? '',
      employee_no: crew.employee_no ?? '',
      id_number: crew.id_number ?? '',
      badge_number: crew.badge_number ?? '',
      badge_expiry: crew.badge_expiry ?? '',
    });
  };

  const handleSave = () => {
    editMutation.mutate(form);
  };
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
      <div className="flex justify-end">
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>
      {/* Avatar and badge section removed to eliminate unused imports */}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <EditableRow
              icon={<PhoneIcon className="h-4 w-4" />}
              label="Phone"
              value={form.phone}
              onChange={(v) => handleChange('phone', v)}
            />
          ) : (
            <InfoRow icon={<PhoneIcon className="h-4 w-4" />} label="Phone" value={crew.phone ?? '-'} />
          )}
          {editing ? (
            <EditableRow
              icon={<EnvelopeIcon className="h-4 w-4" />}
              label="Email"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
            />
          ) : (
            <InfoRow icon={<EnvelopeIcon className="h-4 w-4" />} label="Email" value={crew.email ?? '-'} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <EditableRow
              icon={<UserIcon className="h-4 w-4" />}
              label="Employee No."
              value={form.employee_no}
              onChange={(v) => handleChange('employee_no', v)}
            />
          ) : (
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Employee No." value={crew.employee_no ?? '-'} />
          )}
          {editing ? (
            <EditableRow
              icon={<IdentificationIcon className="h-4 w-4" />}
              label="ID Number"
              value={form.id_number}
              onChange={(v) => handleChange('id_number', v)}
            />
          ) : (
            <InfoRow icon={<IdentificationIcon className="h-4 w-4" />} label="ID Number" value={crew.id_number ?? '-'} />
          )}
          {editing ? (
            <EditableRow
              icon={<CreditCardIcon className="h-4 w-4" />}
              label="Badge No."
              value={form.badge_number}
              onChange={(v) => handleChange('badge_number', v)}
            />
          ) : (
            <InfoRow icon={<CreditCardIcon className="h-4 w-4" />} label="Badge No." value={crew.badge_number ?? '-'} />
          )}
          {editing ? (
            <EditableRow
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Badge Expiry"
              value={form.badge_expiry}
              onChange={(v) => handleChange('badge_expiry', v)}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <InfoRow
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Badge Expiry"
              value={expiryInfo.text}
              valueClassName={expiryInfo.className}
            />
          )}
        </CardContent>
      </Card>

      {editing && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={editMutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={editMutation.isPending}>
            {editMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

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

interface EditableRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function EditableRow({ icon, label, value, onChange, placeholder }: EditableRowProps) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <Input
        value={value}
        placeholder={placeholder || label}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}
