"use client";
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { VehicleCategoryTable } from '@/components/vehicles/VehicleCategoryTable';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';

export default function VehicleTypePage() {
  const params = useParams();
  const typeParamRaw = typeof params?.type === 'string' ? (params.type as string) : '';
  const typeParam = typeParamRaw.toLowerCase();
  const template = useCompanyTemplateStore(s => s.template);
  const templateVehicles = template?.vehicles || [];
  const [q, setQ] = useState('');

  // Determine data source: prefer template vehicles (already cached) else fallback to API hook (removed to avoid extra fetch)
  // Template vehicles lack type_name; we synthesize minimal objects to satisfy table.
  const sourceVehicles = useMemo(() => {
    if (templateVehicles.length > 0) {
      return templateVehicles.map(v => ({
        vehicle_id: String(v.vehicle_id),
        number_plate: v.number_plate,
        investor_id: String(v.investor_id ?? ''),
        vehicle_type_id: '',
        brand_id: null,
        investor_name: '',
        type_name: '', // not provided in template data
        brand_name: null,
        active_status: String(v.active_status ?? ''),
        inspection_status: '',
        rsl_number: null,
        rsl_registration_date: null,
        rsl_expiry_date: null,
        rsl_details: null,
        fleet_number: null,
        crew: [],
        vehicle_collections: { success: true, meta: { company_id: template?.meta?.company_id ?? '', generated_at: template?.meta?.generated_at ?? '', count: 0, vehicle_id: String(v.vehicle_id) }, fields: [] },
      }));
    }
    return [];
  }, [templateVehicles, template]);

  const filtered = useMemo(() => {
    const items = sourceVehicles;
    if (items.length === 0) return [];
    const hasTypeNames = items.some(v => !!v.type_name);
    const base = (!typeParam || typeParam === 'all' || !hasTypeNames)
      ? items
      : items.filter(v => (v.type_name || '').toLowerCase() === typeParam);
    if (!q) return base;
    const qLower = q.toLowerCase();
    return base.filter(v => (v.number_plate || '').toLowerCase().includes(qLower));
  }, [sourceVehicles, typeParam, q]);

  const properLabel = typeParamRaw
    ? typeParamRaw.charAt(0).toUpperCase() + typeParamRaw.slice(1).toLowerCase()
    : 'Vehicle';

  return (
    <PageContainer>
      <PageHeader backHref="/user/vehicles" title={properLabel + ' Category' } />
      <main className="px-4 pb-24 max-w-3xl mx-auto space-y-4">
        {/* <button
          onClick={() => router.push('/user/vehicles')}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Categories
        </button> */}
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={`Search ${properLabel} vehicles by plate...`}
        />
        <VehicleCategoryTable vehicles={filtered} isLoading={false} />
        {filtered.length === 0 && templateVehicles.length > 0 && (
          <p className="text-xs text-gray-500">No matches. (Type filtering disabled: template vehicles lack category data.)</p>
        )}
        {templateVehicles.length === 0 && (
          <p className="text-xs text-gray-500">Vehicles not loaded into template yet. Log out & back in if this persists.</p>
        )}
      </main>
    </PageContainer>
  );
}
