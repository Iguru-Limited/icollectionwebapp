'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { GetCrewsResponse, GetCrewRolesResponse, UpdateCrewRequest, UpdateCrewResponse, CreateCrewRequest, CreateCrewResponse } from '@/types/crew';

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

interface UseUpdateCrewOptions {
  onSuccess?: (data: UpdateCrewResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update crew details
 * Automatically invalidates crew list cache on success
 */
export function useUpdateCrew(options?: UseUpdateCrewOptions) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: UpdateCrewRequest): Promise<UpdateCrewResponse> => {
      const response = await fetch('/api/crews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update crew');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate crew list to refetch with updated data
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to fetch crew roles
 */
export function useCrewRoles() {
  const { data: session } = useSession();

  return useQuery<GetCrewRolesResponse, Error>({
    queryKey: ['crew-roles'],
    queryFn: async () => {
      const response = await fetch('/api/crew-roles');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch crew roles');
      }

      return response.json();
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

interface UseCreateCrewOptions {
  onSuccess?: (data: CreateCrewResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to create a new crew member
 * Automatically invalidates crew list cache on success
 */
export function useCreateCrew(options?: UseCreateCrewOptions) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: CreateCrewRequest): Promise<CreateCrewResponse> => {
      const response = await fetch('/api/crews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create crew member');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate crew list to refetch with new crew
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
