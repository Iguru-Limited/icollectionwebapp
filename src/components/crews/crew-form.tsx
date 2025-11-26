'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrewRoles, useEditCrew, useCreateCrew } from '@/hooks/crew';
import { toast } from 'sonner';
import type { Crew } from '@/types/crew';
import { Spinner } from '@/components/ui/spinner';

interface CrewFormProps {
  crew?: Crew;
  mode: 'create' | 'edit';
}

export function CrewForm({ crew, mode }: CrewFormProps) {
  const router = useRouter();
  const [name, setName] = useState(crew?.name ?? '');
  const [phone, setPhone] = useState(crew?.phone ?? '');
  const [badgeNumber, setBadgeNumber] = useState(crew?.badge_number ?? '');
  const [crewRoleId, setCrewRoleId] = useState(crew?.crew_role_id ?? '');
  const [badgeExpiry, setBadgeExpiry] = useState(
    crew?.badge_expiry ? crew.badge_expiry.split('T')[0] : ''
  );
  const [email, setEmail] = useState(crew?.email ?? '');
  const [employeeNo, setEmployeeNo] = useState(crew?.employee_no ?? '');
  const [idNumber, setIdNumber] = useState(crew?.id_number ?? '');

  const { data: rolesResponse, isLoading: rolesLoading } = useCrewRoles();

  // Always call useEditCrew to comply with React Hooks rules
  // Pass a dummy crew object when crew is undefined to avoid conditional hook call
  const dummyCrew: Crew = crew || {
    crew_id: '',
    name: '',
    phone: '',
    badge_number: '',
    crew_role_id: '',
    role_name: '',
    badge_expiry: null,
    email: null,
    employee_no: null,
    id_number: null,
    type: 'crew',
    vehicle_id: null,
    vehicle_plate: null,
    vehicle_type_name: null,
  };

  const editCrewMutation = useEditCrew(dummyCrew, {
    onSuccess: (data) => {
      toast.success(data.message || 'Crew updated successfully');
      if (crew) {
        router.push(`/user/crews/${crew.crew_id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update crew');
    },
  });

  const createCrewMutation = useCreateCrew({
    onSuccess: (data) => {
      toast.success(data.message || 'Crew member created successfully');
      router.push('/user/crews');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create crew member');
    },
  });

  const isPending = mode === 'edit' ? editCrewMutation.isPending : createCrewMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (mode === 'edit' && crew) {
      // Use editCrewMutation to send only changed fields
      editCrewMutation.mutate({
        name,
        crew_role_id: crewRoleId,
        phone,
        badge_number: badgeNumber,
        badge_expiry: badgeExpiry || null,
        email: email || null,
        employee_no: employeeNo || null,
        id_number: idNumber || null,
      });
    } else {
      // Create new crew member
      createCrewMutation.mutate({
        name,
        crew_role_id: Number(crewRoleId),
        phone,
        badge_number: badgeNumber,
        badge_expiry: badgeExpiry || undefined,
        email: email || undefined,
        employee_no: employeeNo || undefined,
        id_number: idNumber || undefined,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Add New Crew' : 'Edit Crew Details'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Enter crew member name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input 
              id="phone"
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required
              placeholder="0712345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge">Badge Number *</Label>
            <Input 
              id="badge"
              value={badgeNumber} 
              onChange={(e) => setBadgeNumber(e.target.value)} 
              required
              placeholder="BDG-0001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={crewRoleId} onValueChange={setCrewRoleId} required disabled={rolesLoading}>
              <SelectTrigger id="role">
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                    <Spinner className="w-4 h-4" />
                    <span>Loading roles...</span>
                  </div>
                ) : rolesResponse?.success && rolesResponse.data && rolesResponse.data.length > 0 ? (
                  rolesResponse.data.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id.toString()}>
                      {role.role_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 text-sm text-center text-muted-foreground">No roles available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeNo">Employee Number</Label>
            <Input 
              id="employeeNo"
              value={employeeNo} 
              onChange={(e) => setEmployeeNo(e.target.value)} 
              placeholder="EMP-0001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input 
              id="idNumber"
              value={idNumber} 
              onChange={(e) => setIdNumber(e.target.value)} 
              placeholder="National ID Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badgeExpiry">Badge Expiry Date</Label>
            <Input 
              id="badgeExpiry"
              type="date" 
              value={badgeExpiry} 
              onChange={(e) => setBadgeExpiry(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isPending}
        >
          {isPending ? 'Saving...' : mode === 'create' ? 'Add Crew' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
