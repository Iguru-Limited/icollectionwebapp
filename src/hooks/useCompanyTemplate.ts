'use client';

import { useQuery } from '@tanstack/react-query';
import type { CompanyTemplateResponse } from '@/types/company-template';

async function fetchCompanyTemplate(): Promise<CompanyTemplateResponse> {
  const res = await fetch('/api/company-template', { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load company template');
  }
  return res.json();
}

export function useCompanyTemplate() {
  return useQuery<CompanyTemplateResponse, Error>({
    queryKey: ['companyTemplate'],
    queryFn: fetchCompanyTemplate,
    staleTime: 5 * 60 * 1000,
  });
}
