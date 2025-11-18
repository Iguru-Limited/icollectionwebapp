"use client";
import { useEffect, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { AssignmentForm, AssignmentList, type Assignment, type Crew, type Vehicle } from '@/components/assign';

export default function AssignPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    (async () => {
      const [cRes, vRes, aRes] = await Promise.all([
        fetch('/api/crews'),
        fetch('/api/vehicles'),
        fetch('/api/assign'),
      ]);
      const [c, v, a] = await Promise.all([cRes.json(), vRes.json(), aRes.json()]);
      setCrews(c.data ?? []);
      setVehicles(v.data ?? []);
      setAssignments(a.data ?? []);
    })();
  }, []);

  async function handleAssign(crewId: string, vehicleId: string) {
    const res = await fetch('/api/assign', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ crewId, vehicleId }) 
    });
    const json = await res.json();
    if (res.ok) {
      setAssignments(prev => [json.data, ...prev]);
    }
  }

  return (
    <PageContainer>
      <PageHeader title="New Assignment" />
      <main className="px-4 pb-24 max-w-sm mx-auto space-y-4">
        <AssignmentForm 
          crews={crews} 
          vehicles={vehicles} 
          onAssign={handleAssign} 
        />
        <AssignmentList 
          assignments={assignments} 
          crews={crews} 
          vehicles={vehicles} 
        />
      </main>
    </PageContainer>
  );
}