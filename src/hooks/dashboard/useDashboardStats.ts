"use client";

import { useQuery } from "@tanstack/react-query";
import type { GetDashboardStatsResponse } from "@/types/dashboard";

export function useDashboardStats(companyId?: number | string) {
  return useQuery<GetDashboardStatsResponse, Error>({
    queryKey: ["dashboard-stats", companyId ?? "default"],
    queryFn: async () => {
      const url = companyId ? `/api/dashboard-stats?company_id=${companyId}` : "/api/dashboard-stats";
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to fetch dashboard stats" }));
        throw new Error(err.error || "Failed to fetch dashboard stats");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
