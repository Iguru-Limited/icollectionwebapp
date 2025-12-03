"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { Crew, EditCrewPayload, EditCrewResponse } from '@/types/crew';

interface UseEditCrewOptions {
  onSuccess?: (data: EditCrewResponse) => void;
  onError?: (error: Error) => void;
}

// Utility: build diff payload from original + updated partial form data
function buildDiffPayload(original: Crew, updated: Partial<Crew>): EditCrewPayload {
  const payload: EditCrewPayload = { crew_id: original.crew_id };
  const keys: (keyof Crew)[] = [
    'name','phone','badge_number','crew_role_id','role_name','badge_expiry','email','employee_no','id_number','type','photo'
  ];
  keys.forEach((k) => {
    if (k === 'type') return; // not editable
    if (updated[k] !== undefined && updated[k] !== original[k]) {
      // Coerce to string for crew_role_id if needed
      if (k === 'crew_role_id' && updated[k]) {
        payload[k] = String(updated[k]);
      } else {
        (payload as unknown as Record<string, unknown>)[k] = updated[k];
      }
    }
  });
  return payload;
}

export function useEditCrew(originalCrew: Crew, options?: UseEditCrewOptions) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<EditCrewResponse, Error, Partial<Crew>>({
    mutationFn: async (updated: Partial<Crew>) => {
      const diff = buildDiffPayload(originalCrew, updated);
      const res = await fetch('/api/crews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diff),
      });
      const json = await res.json().catch(() => ({ message: 'Unknown response' }));
      if (!res.ok) {
        throw new Error((json && (json.error || json.message)) || 'Failed to edit crew');
      }
      return json as EditCrewResponse;
    },
    onSuccess: (data) => {
      // Invalidate crews list & individual crew queries
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      queryClient.invalidateQueries({ queryKey: ['crew', originalCrew.crew_id] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
