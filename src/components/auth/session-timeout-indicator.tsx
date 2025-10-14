"use client";

import { useSessionTimeout } from "@/hooks/auth/useSessionTimeout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

/**
 * Component to display session timeout information to users
 * Shows time remaining and warns when session is about to expire
 */
export function SessionTimeoutIndicator() {
  const { timeRemaining, isExpired, isAuthenticated } = useSessionTimeout();

  // Parse time remaining to show warnings
  const timeInMinutes = timeRemaining.includes('h') 
    ? parseInt(timeRemaining.split('h')[0]) * 60 + parseInt(timeRemaining.split('h')[1].split('m')[0] || '0')
    : timeRemaining.includes('m') 
    ? parseInt(timeRemaining.split('m')[0])
    : 0;

  // Show warning if less than 30 minutes remaining
  const showWarning = timeInMinutes < 30 && timeInMinutes > 0;

  // Show toast warning when session is about to expire
  useEffect(() => {
    if (showWarning && timeInMinutes === 5) {
      toast.warning("Your session will expire in 5 minutes. Please save your work.", {
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [showWarning, timeInMinutes]);

  // Don't show if not authenticated or if session is expired
  if (!isAuthenticated || isExpired) {
    return null;
  }

  return (
    <Card className={`w-fit ${showWarning ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm">
          {showWarning ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          ) : (
            <Clock className="h-4 w-4 text-green-600" />
          )}
          <span className={showWarning ? 'text-orange-800' : 'text-green-800'}>
            Session expires in: <strong>{timeRemaining}</strong>
          </span>
        </div>
        {showWarning && (
          <p className="text-xs text-orange-700 mt-1">
            Please save your work. You will be automatically logged out when the session expires.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
