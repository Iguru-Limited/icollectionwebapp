"use client";
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { GetVehiclesResponse } from '@/types/vehicle';

interface UseVehiclesOptions {
  companyId?: string | number;
  enabled?: boolean;
}

export function useVehicles(options?: UseVehiclesOptions) {
  const { data: session } = useSession();
  const companyId = options?.companyId ?? session?.user?.company?.company_id;
  const enabled = (options?.enabled ?? true) && !!companyId;

  return useQuery<GetVehiclesResponse, Error>({
    queryKey: ['vehicles', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID is required');
      const res = await fetch(`/api/vehicles?company_id=${companyId}`);
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || 'Failed to fetch vehicles');
      }
      let json: unknown;
      try { json = JSON.parse(text); } catch { throw new Error('Invalid vehicles response'); }
      const data = json as GetVehiclesResponse;
      if (!data.success) throw new Error(data.message || 'Vehicles request failed');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Convenience hook to get just flattened basic vehicle info for list tables
export function useVehicleBasics(options?: UseVehiclesOptions) {
  const query = useVehicles(options);
  return {
    ...query,
    vehicles: (query.data?.data || []).map(v => ({
      vehicle_id: Number(v.vehicle_id),
      number_plate: v.number_plate,
      type_name: v.type_name,
      active_status: v.active_status,
    })),
  };
}