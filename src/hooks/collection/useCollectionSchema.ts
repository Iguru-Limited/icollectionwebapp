'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { GetCollectionSchemaResponse } from '@/types/collection-schema';

interface UseCollectionSchemaOptions {
  companyId?: number | string;
  enabled?: boolean;
}

/**
 * Hook to fetch collection form schema for a company
 * Returns the dynamic collection fields from the API
 */
export function useCollectionSchema(options?: UseCollectionSchemaOptions) {
  const { data: session } = useSession();
  
  const companyId = session?.user?.company?.company_id;
  const enabled = options?.enabled !== false && !!session?.user?.token;

  return useQuery({
    queryKey: ['collection-schema', companyId],
    queryFn: async (): Promise<GetCollectionSchemaResponse> => {
      const response = await fetch('/api/collection-schema', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch collection schema');
      }

      return response.json();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
