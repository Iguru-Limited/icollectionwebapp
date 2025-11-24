"use client";
import { useParams } from 'next/navigation';
import { useMemo, useState, useDeferredValue } from 'react';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { VehicleCategoryTable } from '@/components/vehicles/VehicleCategoryTable';
import { useVehicles } from '@/hooks/vehicle/useVehicles';

export default function VehicleTypePage() {
  const params = useParams();
  const typeParamRaw = typeof params?.type === 'string' ? (params.type as string) : '';
  const typeParam = typeParamRaw.toLowerCase();
  const { data: vehiclesData, isLoading } = useVehicles();
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q.trim().toLowerCase());

  const filtered = useMemo(() => {
    const items = vehiclesData?.data || [];
    if (items.length === 0) return [];
    const hasTypeNames = items.some(v => !!v.type_name);

    // Special handling for "null" / "uncategorized" parameters to show vehicles without type_name
    if (typeParam === 'null' || typeParam === 'uncategorized') {
      const uncategorized = items.filter(v => !v.type_name);
      const baseSet = uncategorized.length > 0 ? uncategorized : items; // fallback if none explicitly null
      if (!deferredQ) return baseSet;
      return baseSet.filter(v => (v.number_plate || '').toLowerCase().includes(deferredQ));
    }

    let base: typeof items;
    if (!typeParam || typeParam === 'all' || !hasTypeNames) {
      base = items;
    } else {
      const matches = items.filter(v => (v.type_name || '').toLowerCase() === typeParam);
      // Fallback to all items if category produced zero matches to avoid empty table when data exists
      base = matches.length > 0 ? matches : items;
    }

    if (!deferredQ) return base;
    // Extended search: plate OR crew names
    return base.filter(v => {
      const plate = (v.number_plate || '').toLowerCase();
      const driver = v.crew?.find(c => c.crew_role_id === '3')?.name?.toLowerCase() || '';
      const conductor = v.crew?.find(c => c.crew_role_id === '12')?.name?.toLowerCase() || '';
      return plate.includes(deferredQ) || driver.includes(deferredQ) || conductor.includes(deferredQ);
    });
  }, [vehiclesData?.data, typeParam, deferredQ]);

  const properLabel = !typeParamRaw
    ? 'Vehicle'
    : (typeParam === 'null' || typeParam === 'uncategorized')
      ? 'Uncategorized'
      : typeParamRaw.charAt(0).toUpperCase() + typeParamRaw.slice(1).toLowerCase();

  return (
    <PageContainer>
      <PageHeader backHref="/user/vehicles" title={properLabel + ' Category'} />
      <main className="px-4 pb-24 max-w-3xl mx-auto space-y-4">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={`Search ${properLabel} by plate, driver, or conductor...`}
        />
        <VehicleCategoryTable vehicles={filtered} isLoading={isLoading} />
        {(!isLoading && filtered.length === 0 && (vehiclesData?.data || []).length > 0) && (
          <p className="text-xs text-gray-500">No vehicles matched this category/search. Showing all might help: navigate to /user/vehicles/types/all.</p>
        )}
        {(!isLoading && filtered.length > 0 && typeParam && filtered.length === (vehiclesData?.data || []).length && typeParam !== 'all' && typeParam !== 'null' && typeParam !== 'uncategorized') && (
          <p className="text-[10px] text-gray-400">Category produced no direct matches; displaying all vehicles as fallback.</p>
        )}
        {(!isLoading && (vehiclesData?.data || []).length === 0) && (
          <p className="text-xs text-gray-500">No vehicles returned by list endpoint.</p>
        )}
      </main>
    </PageContainer>
  );
}
