"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import type {
  ReportByVehicleDateResponse,
} from "@/types/receipt";

interface UseReportByVehicleDateOptions {
  onSuccess?: (data: ReportByVehicleDateResponse) => void;
  onError?: (error: string) => void;
}

export function useReportByVehicleDate(options?: UseReportByVehicleDateOptions) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportByVehicleDateResponse | null>(null);

  const fetchReport = async (vehicleId: number, date: string) => {
    // Validate required session data
    if (!session?.user?.company?.company_id) {
      const errorMsg = "Company ID not found in session";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body = {
        company_id: Number(session.user.company.company_id),
        vehicle_id: Number(vehicleId),
        date,
      };

      const response = await fetch("/api/report-by-vehicle-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let message = "Failed to fetch vehicle report";
        try {
          const errJson = await response.json();
          message = errJson.error || errJson.message || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const result: ReportByVehicleDateResponse = await response.json();

      if (!result.success) {
        throw new Error("Report request was not successful");
      }

      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchReport,
    isLoading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    },
  };
}
