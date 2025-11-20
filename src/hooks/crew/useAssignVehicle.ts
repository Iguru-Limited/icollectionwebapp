'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssignVehiclePayload, AssignVehicleResponse } from '@/types/crew';

interface UseAssignVehicleOptions {
  onSuccess?: (data: AssignVehicleResponse, variables: AssignVehiclePayload) => void;
  onError?: (error: Error, variables: AssignVehiclePayload) => void;
}

export function useAssignVehicle(options?: UseAssignVehicleOptions) {
  const queryClient = useQueryClient();

  return useMutation<AssignVehicleResponse, Error, AssignVehiclePayload>({
    mutationFn: async (payload: AssignVehiclePayload) => {
      const res = await fetch('/api/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ message: 'Unknown response' }));
      if (!res.ok) {
        throw new Error((json && (json.error || json.message)) || 'Failed to assign vehicle');
      }
      return json as AssignVehicleResponse;
    },
    onSuccess: (data, variables) => {
      const crewIds = Array.isArray(variables.crew_id) ? variables.crew_id : [variables.crew_id];
      crewIds.forEach((cid) => {
        queryClient.invalidateQueries({ queryKey: ['crew-history', String(cid)] });
      });
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}
