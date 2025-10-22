"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import type {
  SaveReceiptRequest,
  SaveReceiptResponse,
  ReceiptPayload,
} from "@/types/receipt";

interface UseSaveReceiptOptions {
  onSuccess?: (data: SaveReceiptResponse) => void;
  onError?: (error: string) => void;
}

export function useSaveReceipt(options?: UseSaveReceiptOptions) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SaveReceiptResponse | null>(null);

  const saveReceipt = async (
    vehicleId: number,
    payload: ReceiptPayload
  ) => {
    if (!session?.user?.company?.company_id) {
      const errorMsg = "Company ID not found in session";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return null;
    }

    if (!session?.user?.user_id) {
      const errorMsg = "User ID not found in session";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return null;
    }

    if (!session?.user?.stage?.stage_id) {
      const errorMsg = "Stage ID not found in session";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody: Omit<SaveReceiptRequest, "route"> = {
        company_id: Number(session.user.company.company_id),
        vehicle_id: vehicleId,
        user_id: Number(session.user.user_id),
        stage_id: Number(session.user.stage.stage_id),
        payload,
      };

      const response = await fetch("/api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save receipt");
      }

      const result: SaveReceiptResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to save receipt");
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
    saveReceipt,
    isLoading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    },
  };
}
