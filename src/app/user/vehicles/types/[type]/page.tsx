"use client";
import { useParams } from 'next/navigation';
import { useMemo, useState, useDeferredValue, Suspense } from 'react';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { VehicleCategoryTable } from '@/components/vehicles/VehicleCategoryTable';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import { Card } from '@/components/ui/card';

export default function VehicleTypePage() {
  const params = useParams();
  const typeParamRaw = typeof params?.type === 'string' ? (params.type as string) : '';
  const typeParam = typeParamRaw.toLowerCase();
  const { data: vehiclesData, isLoading } = useVehicles();
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q.trim().toLowerCase());
  const [visibleCount, setVisibleCount] = useState(20); // Lazy load: show 20 items at a time

  const filtered = useMemo(() => {
    const items = vehiclesData?.data || [];
    if (items.length === 0) return [];
    const hasTypeNames = items.some(v => !!v.type_name);

    // Special handling for "null" / "uncategorized" parameters to show vehicles without type_name
    if (typeParam === 'null' || typeParam === 'uncategorized') {
      const uncategorized = items.filter(v => !v.type_name);
      const baseSet = uncategorized.length > 0 ? uncategorized : items; // fallback if none explicitly null
      if (!deferredQ) return baseSet;
      return baseSet.filter(v => (v.number_plate || '').toLowerCase().includes(deferredQ) || (v.fleet_number || '').toLowerCase().includes(deferredQ));
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
    // Extended search: plate OR fleet number OR crew names
    return base.filter(v => {
      const plate = (v.number_plate || '').toLowerCase();
      const fleetNumber = (v.fleet_number || '').toLowerCase();
      const driver = v.crew?.find(c => c.crew_role_id === '3')?.name?.toLowerCase() || '';
      const conductor = v.crew?.find(c => c.crew_role_id === '12')?.name?.toLowerCase() || '';
      return plate.includes(deferredQ) || fleetNumber.includes(deferredQ) || driver.includes(deferredQ) || conductor.includes(deferredQ);
    });
  }, [vehiclesData?.data, typeParam, deferredQ]);

  // Lazy load: only display first visibleCount items
  const displayedVehicles = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const hasMore = filtered.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const properLabel = !typeParamRaw
    ? 'Vehicle'
    : (typeParam === 'null' || typeParam === 'uncategorized')
      ? 'Uncategorized'
      : typeParamRaw.charAt(0).toUpperCase() + typeParamRaw.slice(1).toLowerCase();

  // Calculate stats
  const totalVehicles = filtered.length;
  const assignedVehicles = filtered.filter(v => v.crew && v.crew.length > 0).length;
  const unassignedVehicles = totalVehicles - assignedVehicles;

  return (
    <PageContainer>
      <PageHeader backHref="/user/vehicles" title={properLabel} />
      <main className="px-4 pb-24 max-w-screen-xl mx-auto space-y-4">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {/* Stats Skeleton - Mobile Only */}
            <div className="md:hidden space-y-3">
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />

            {/* Table Skeleton */}
            <Card className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              ))}
            </Card>
          </div>
        )}

        {/* Content - Rendered when data is loaded */}
        {!isLoading && (
          <>
            {/* Stats Section - Mobile Only */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{properLabel.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">{totalVehicles} active</div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="text-xs text-gray-600">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Assigned</span>
                  </div>
                  <div className="text-2xl font-bold">{assignedVehicles}</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Unassigned</span>
                  </div>
                  <div className="text-2xl font-bold">{unassignedVehicles}</div>
                </div>
              </div>
            </div>

            <SearchBar
              value={q}
              onChange={setQ}
              placeholder={`Search ${properLabel} by plate, driver, or conductor...`}
            />
            
            {/* Vehicle Table with Lazy Loading */}
            <VehicleCategoryTable vehicles={displayedVehicles} isLoading={false} />

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Load More ({visibleCount} of {filtered.length})
                </button>
              </div>
            )}

            {/* Empty State Messages */}
            {(!filtered.length && (vehiclesData?.data || []).length > 0) && (
              <p className="text-xs text-gray-500">No vehicles matched this category/search. Showing all might help: navigate to /user/vehicles/types/all.</p>
            )}
            {(filtered.length > 0 && typeParam && filtered.length === (vehiclesData?.data || []).length && typeParam !== 'all' && typeParam !== 'null' && typeParam !== 'uncategorized') && (
              <p className="text-[10px] text-gray-400">Category produced no direct matches; displaying all vehicles as fallback.</p>
            )}
            {((vehiclesData?.data || []).length === 0) && (
              <p className="text-xs text-gray-500">No vehicles returned by list endpoint.</p>
            )}
          </>
        )}
      </main>
    </PageContainer>
  );
}
