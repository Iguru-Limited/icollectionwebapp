import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface UnassignCrewParams {
  crew_id: string | number;
  role: 'conductor' | 'driver';
}

interface UnassignCrewResponse {
  success: boolean;
  message: string;
}

export function useUnassignCrew(callbacks?: {
  onSuccess?: (data: UnassignCrewResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const companyId = session?.user?.company?.company_id;

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: async ({ crew_id, role }: UnassignCrewParams): Promise<UnassignCrewResponse> => {
      const response = await fetch('/api/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: null,
          crew_id: Number(crew_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to unassign crew' }));
        throw new Error(errorData.message || 'Failed to unassign crew');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] });
        queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      }
      queryClient.invalidateQueries({ queryKey: ['crews'] });
      
      callbacks?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
}
