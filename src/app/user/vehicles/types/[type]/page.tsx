"use client";
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { VehicleCategoryTable } from '@/components/vehicles/VehicleCategoryTable';
import { useVehicles } from '@/hooks/vehicle/useVehicles';

export default function VehicleTypePage() {
  const params = useParams();
  const typeParamRaw = typeof params?.type === 'string' ? (params.type as string) : '';
  const typeParam = typeParamRaw.toLowerCase();
  const { data: vehiclesData, isLoading } = useVehicles();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const items = vehiclesData?.data || [];
    if (items.length === 0) return [];
    const hasTypeNames = items.some(v => !!v.type_name);
    const base = (!typeParam || typeParam === 'all' || !hasTypeNames)
      ? items
      : items.filter(v => (v.type_name || '').toLowerCase() === typeParam);
    if (!q) return base;
    const qLower = q.toLowerCase();
    return base.filter(v => (v.number_plate || '').toLowerCase().includes(qLower));
  }, [vehiclesData?.data, typeParam, q]);

  const properLabel = typeParamRaw
    ? typeParamRaw.charAt(0).toUpperCase() + typeParamRaw.slice(1).toLowerCase()
    : 'Vehicle';

  return (
    <PageContainer>
      <PageHeader backHref="/user/vehicles" title={properLabel + ' Category'} />
      <main className="px-4 pb-24 max-w-3xl mx-auto space-y-4">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={`Search ${properLabel} vehicles by plate...`}
        />
        <VehicleCategoryTable vehicles={filtered} isLoading={isLoading} />
        {(!isLoading && filtered.length === 0 && (vehiclesData?.data || []).length > 0) && (
          <p className="text-xs text-gray-500">No matches for this category/search. Try 'all'.</p>
        )}
        {(!isLoading && (vehiclesData?.data || []).length === 0) && (
          <p className="text-xs text-gray-500">No vehicles returned by list endpoint.</p>
        )}
      </main>
    </PageContainer>
  );
}
