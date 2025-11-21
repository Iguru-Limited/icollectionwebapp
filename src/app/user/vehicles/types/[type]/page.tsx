"use client";
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { VehicleCategoryTable } from '@/components/vehicles/VehicleCategoryTable';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function VehicleTypePage() {
  const params = useParams();
  const router = useRouter();
  const typeParam = (params?.type as string)?.toLowerCase();
  const { data, isLoading } = useVehicles();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const items = data?.data || [];
    return items.filter(v => v.type_name.toLowerCase() === typeParam && (
      !q || v.number_plate.toLowerCase().includes(q.toLowerCase())
    ));
  }, [data?.data, typeParam, q]);

  const properLabel = typeParam.charAt(0).toUpperCase() + typeParam.slice(1).toLowerCase();

  return (
    <PageContainer>
      <PageHeader title={properLabel + ' Category'} />
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
        <VehicleCategoryTable vehicles={filtered} isLoading={isLoading} />
      </main>
    </PageContainer>
  );
}
