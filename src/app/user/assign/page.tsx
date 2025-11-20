"use client";
import { useState, useMemo } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useCrews } from '@/hooks/crew';
import { useAssignVehicle } from '@/hooks/crew';
import type { Crew } from '@/types/crew';
import { toast } from 'sonner';

interface SimpleVehicle { vehicle_id: number; number_plate: string }

export default function AssignPage() {
  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);

  // Hydrate template from session if not in store (client-side fallback)
  if (!template && session?.company_template) {
    setTemplate(session.company_template);
  }

  // Crews hook
  const { data: crewsResponse, isLoading: crewsLoading, error: crewsError } = useCrews();
  const crews: Crew[] = crewsResponse?.data ?? [];

  const vehicles: SimpleVehicle[] = (template?.vehicles ?? []).map(v => ({
    vehicle_id: v.vehicle_id,
    number_plate: v.number_plate,
  }));

  // Form state
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [crewQueries, setCrewQueries] = useState<string[]>(['']);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>(['']);

  const { mutateAsync: assignVehicle, isPending } = useAssignVehicle({
    onSuccess: (data) => {
      toast.success(data.message || 'Assignment successful');
      // Reset form
      setSelectedVehicleId(null);
      setVehicleQuery('');
      setSelectedCrewIds([]);
      setCrewQueries(['']);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Filtering logic
  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) return [];
    return vehicles.filter(v => v.number_plate.toLowerCase().includes(q)).slice(0, 8);
  }, [vehicleQuery, vehicles]);

  const filteredCrews = (index: number) => {
    const q = crewQueries[index]?.trim().toLowerCase();
    if (!q) return [];
    return crews.filter(c => c.name.toLowerCase().includes(q) || c.badge_number.toLowerCase().includes(q)).slice(0, 8);
  };

  const canAddAnotherCrew = crewQueries.length < 2;
  const showCrewError = selectedCrewIds.filter(Boolean).length === 0 && crewQueries.some(q => q.length > 0);

  async function handleAssign() {
    const picked = selectedCrewIds.filter(Boolean);
    if (!selectedVehicleId || picked.length === 0) {
      toast.error('Select vehicle and at least one crew');
      return;
    }
    const crewIdPayload = picked.length === 1 ? Number(picked[0]) : picked.map(id => Number(id));
    await assignVehicle({ vehicle_id: selectedVehicleId, crew_id: crewIdPayload });
  }

  return (
    <PageContainer>
      <PageHeader title="Assign vehicle" />
      <main className="px-4 pb-24 max-w-sm mx-auto">
        <Card className="p-6 rounded-2xl space-y-6 border-gray-200">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <div className="text-sm md:text-base font-semibold text-gray-900">select vehicle</div>
            <div className="relative">
              <Input
                value={vehicleQuery}
                onChange={(e) => {
                  setVehicleQuery(e.target.value);
                  setSelectedVehicleId(null);
                }}
                placeholder="search by name"
                className="h-12 rounded-full pl-4 pr-4 text-base md:text-lg placeholder:text-black"
              />
              {vehicleQuery && filteredVehicles.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm max-h-56 overflow-auto text-sm">
                  {filteredVehicles.map(v => (
                    <li
                      key={v.vehicle_id}
                      className="px-3 py-2 cursor-pointer hover:bg-purple-50 flex justify-between"
                      onClick={() => {
                        setSelectedVehicleId(v.vehicle_id);
                        setVehicleQuery(v.number_plate);
                      }}
                    >
                      <span className="font-medium uppercase">{v.number_plate}</span>
                      {selectedVehicleId === v.vehicle_id && <span className="text-purple-600 text-xs">selected</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedVehicleId && (
              <div className="text-[11px] text-green-600">Vehicle selected.</div>
            )}
          </div>

          {/* Crew Selection */}
          <div className="space-y-5">
            {crewQueries.map((query, idx) => (
              <div key={idx} className="space-y-2">
                {idx === 0 && <div className="text-sm md:text-base font-semibold text-gray-900">select crew</div>}
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCrewQueries(prev => prev.map((q, i) => i === idx ? val : q));
                      setSelectedCrewIds(prev => prev.map((id, i) => i === idx ? '' : id));
                    }}
                    placeholder="search by name"
                    className="h-12 rounded-full pl-4 pr-4 text-base md:text-lg placeholder:text-black"
                  />
                  {query && filteredCrews(idx).length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm max-h-56 overflow-auto text-sm">
                      {filteredCrews(idx).map(c => (
                        <li
                          key={c.crew_id}
                          className="px-3 py-2 cursor-pointer hover:bg-purple-50 flex justify-between"
                          onClick={() => {
                            setSelectedCrewIds(prev => prev.map((id, i) => i === idx ? c.crew_id : id));
                            setCrewQueries(prev => prev.map((q, i) => i === idx ? c.name : q));
                          }}
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-gray-400 text-xs uppercase">{c.badge_number}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedCrewIds[idx] && (
                  <div className="text-[11px] text-green-600">Crew selected.</div>
                )}
              </div>
            ))}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full h-12 px-6 bg-purple-700 hover:bg-purple-800 text-white"
                onClick={() => {
                  if (canAddAnotherCrew) {
                    setCrewQueries(prev => [...prev, '']);
                    setSelectedCrewIds(prev => [...prev, '']);
                  }
                }}
                disabled={!canAddAnotherCrew}
              >
                add another
              </Button>
            </div>
            {showCrewError && (
              <div className="text-[11px] text-red-600">Select a crew from the list.</div>
            )}
          </div>

          {/* Assign Action */}
          <div>
            <Button
              type="button"
              disabled={isPending || !selectedVehicleId || selectedCrewIds.filter(Boolean).length === 0}
              onClick={handleAssign}
              className="w-full h-12 rounded-full bg-purple-700 hover:bg-purple-800 text-white"
            >
              {isPending ? <Spinner className="w-4 h-4" /> : 'Assign'}
            </Button>
          </div>
        </Card>
        {crewsError && (
          <div className="text-xs text-red-600 mt-4">Failed to load crews: {crewsError.message}</div>
        )}
        {crewsLoading && (
          <div className="mt-4 flex justify-center"><Spinner className="w-5 h-5" /></div>
        )}
      </main>
    </PageContainer>
  );
}