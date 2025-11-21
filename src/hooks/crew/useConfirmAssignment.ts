'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConfirmAssignmentPayload, ConfirmAssignmentResponse } from '@/types/crew';

interface UseConfirmAssignmentOptions {
  onSuccess?: (data: ConfirmAssignmentResponse) => void;
  onError?: (error: Error) => void;
}

export function useConfirmAssignment(options?: UseConfirmAssignmentOptions) {
  const queryClient = useQueryClient();

  return useMutation<ConfirmAssignmentResponse, Error, ConfirmAssignmentPayload>({
    mutationFn: async (payload: ConfirmAssignmentPayload) => {
      const res = await fetch('/api/assign/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ message: 'Unknown response' }));
      if (!res.ok) {
        throw new Error((json && (json.error || json.message)) || 'Failed to confirm assignment');
      }
      return json as ConfirmAssignmentResponse;
    },
    onSuccess: (data) => {
      // Invalidate crews and vehicles queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['crews'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useCancelAssignment(options?: UseConfirmAssignmentOptions) {
  const queryClient = useQueryClient();

  return useMutation<ConfirmAssignmentResponse, Error, ConfirmAssignmentPayload>({
    mutationFn: async (payload: ConfirmAssignmentPayload) => {
      const res = await fetch('/api/assign/confirm', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ message: 'Unknown response' }));
      if (!res.ok) {
        throw new Error((json && (json.error || json.message)) || 'Failed to cancel assignment');
      }
      return json as ConfirmAssignmentResponse;
    },
    onSuccess: (data) => {
      // Invalidate crews and vehicles queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['crews'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
