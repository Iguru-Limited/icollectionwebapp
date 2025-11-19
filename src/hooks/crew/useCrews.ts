'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { GetCrewsResponse } from '@/types/crew';

interface UseCrewsOptions {
  companyId?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch crew list for a company
 * Uses React Query for caching and automatic refetching
 */
export function useCrews(options?: UseCrewsOptions) {
  const { data: session } = useSession();
  
  const companyId = options?.companyId || session?.user?.company?.company_id;
  const enabled = options?.enabled !== false && !!companyId;

  return useQuery({
    queryKey: ['crews', companyId],
    queryFn: async (): Promise<GetCrewsResponse> => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const response = await fetch(`/api/crews?company_id=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch crews');
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

/**
 * Hook to get a specific crew by ID from the cached crews list
 */
export function useCrew(crewId: string, options?: UseCrewsOptions) {
  const { data: crewsResponse, ...queryResult } = useCrews(options);

  const crew = crewsResponse?.data?.find((c) => c.crew_id === crewId);

  return {
    ...queryResult,
    data: crew,
    crew,
  };
}
