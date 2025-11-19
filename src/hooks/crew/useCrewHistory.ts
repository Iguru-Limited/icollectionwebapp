"use client";

import { useQuery } from '@tanstack/react-query';
import type { GetCrewHistoryResponse } from '@/types/crew';

export function useCrewHistory(crewId: string, enabled: boolean = true) {
  return useQuery<GetCrewHistoryResponse, Error>({
    queryKey: ['crew-history', crewId],
    enabled: enabled && !!crewId,
    queryFn: async () => {
      const res = await fetch(`/api/crews/${crewId}/history`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch crew history');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
