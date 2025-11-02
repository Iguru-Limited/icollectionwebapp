'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ReportByVehicleDateResponse } from '@/types/receipt';

interface UseReportByVehicleDateOptions {
  onSuccess?: (data: ReportByVehicleDateResponse) => void;
  onError?: (error: string) => void;
}

export function useReportByVehicleDate(options?: UseReportByVehicleDateOptions) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportByVehicleDateResponse | null>(null);
  const inFlightKeyRef = useRef<string | null>(null);
  const dataRef = useRef<ReportByVehicleDateResponse | null>(null);
  const onSuccessRef = useRef<UseReportByVehicleDateOptions['onSuccess'] | undefined>(
    options?.onSuccess,
  );
  const onErrorRef = useRef<UseReportByVehicleDateOptions['onError'] | undefined>(options?.onError);

  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
    onErrorRef.current = options?.onError;
  }, [options?.onSuccess, options?.onError]);

  const fetchReport = useCallback(
    async (vehicleId: number, date: string) => {
      // Validate required session data
      if (!session?.user?.company?.company_id) {
        const errorMsg = 'Company ID not found in session';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
        return null;
      }

      // Simple de-duplication by key to avoid repeated calls with the same args
      const key = `${session.user.company.company_id}-${vehicleId}-${date}`;
      if (inFlightKeyRef.current === key) {
        return dataRef.current; // return existing data to avoid duplicate call
      }
      inFlightKeyRef.current = key;

      setIsLoading(true);
      setError(null);

      try {
        const body = {
          company_id: Number(session.user.company.company_id),
          vehicle_id: Number(vehicleId),
          date,
        };

        const response = await fetch('/api/report-by-vehicle-date', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let message = 'Failed to fetch vehicle report';
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
          throw new Error('Report request was not successful');
        }

        setData(result);
        dataRef.current = result;
        onSuccessRef.current?.(result);
        inFlightKeyRef.current = null;
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
        inFlightKeyRef.current = null;
        return null;
      } finally {
        setIsLoading(false);
      }
      // Only re-create if company_id changes
    },
    [session?.user?.company?.company_id],
  );

  return {
    fetchReport,
    isLoading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
      dataRef.current = null;
    },
  };
}
