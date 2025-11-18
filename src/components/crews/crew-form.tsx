import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { THEME_COLORS } from '@/lib/utils/constants';
import { Crew } from './crew-card';

interface CrewFormProps {
  crew?: Crew;
  mode: 'create' | 'edit';
}

export function CrewForm({ crew, mode }: CrewFormProps) {
  const router = useRouter();
  const [name, setName] = useState(crew?.name ?? '');
  const [phone, setPhone] = useState(crew?.phone ?? '');
  const [badgeNo, setBadgeNo] = useState(crew?.badgeNo ?? '');
  const [badgeExpiry, setBadgeExpiry] = useState(crew?.badgeExpiry?.split('T')[0] ?? '');
  const [employeeNo, setEmployeeNo] = useState(crew?.employeeNo ?? '');
  const [role, setRole] = useState(crew?.role ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name, phone, badgeNo, badgeExpiry, employeeNo, role };
      const url = mode === 'create' ? '/api/crews' : `/api/crews/${crew?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        router.push('/crews');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this crew member?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crews/${crew?.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/crews');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: THEME_COLORS.SURFACE }}>
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Badge Number</Label>
          <Input value={badgeNo} onChange={(e) => setBadgeNo(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Badge Expiry</Label>
          <Input type="date" value={badgeExpiry} onChange={(e) => setBadgeExpiry(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Employee Number</Label>
          <Input value={employeeNo} onChange={(e) => setEmployeeNo(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="conductor">Conductor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {mode === 'create' ? 'Add Crew' : 'Save Changes'}
      </Button>

      {mode === 'edit' && (
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={saving}
        >
          Delete Crew
        </Button>
      )}
    </form>
  );
}
