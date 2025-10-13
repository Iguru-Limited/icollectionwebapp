"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getTimeUntilExpiry, formatTimeRemaining, isSessionExpired } from "@/lib/utils/session-utils";

/**
 * Hook to track session timeout and provide session information
 * @returns Object containing session timeout information
 */
export function useSessionTimeout() {
  const { data: session, status } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Get the token from the session (this would need to be passed through the session)
      // For now, we'll use a placeholder approach
      const checkExpiry = () => {
        // In a real implementation, you'd get the expiresAt from the JWT token
        // For now, we'll simulate with a 1-hour window from login
        const loginTime = sessionStorage.getItem('loginTime');
        if (loginTime) {
          const expiresAt = parseInt(loginTime) + (60 * 60 * 1000);
          const remaining = getTimeUntilExpiry(expiresAt);
          const expired = isSessionExpired(expiresAt);
          
          setTimeRemaining(formatTimeRemaining(remaining));
          setIsExpired(expired);
        }
      };

      // Check immediately
      checkExpiry();

      // Check every 30 seconds
      const interval = setInterval(checkExpiry, 30000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining("");
      setIsExpired(false);
    }
  }, [status, session]);

  return {
    timeRemaining,
    isExpired,
    isAuthenticated: status === "authenticated",
    session
  };
}
