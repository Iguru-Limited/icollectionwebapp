"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { IconAlertTriangle, IconWifi, IconWifiOff, IconRefresh, IconX } from '@tabler/icons-react';
import { RefreshError, tokenRefreshService, RefreshErrorType } from '@/lib/utils/token-refresh';

interface TokenRefreshNotificationsProps {
  onRetry?: () => void;
  onLogout?: () => void;
}

export function TokenRefreshNotifications({ onRetry, onLogout }: TokenRefreshNotificationsProps) {
  const [lastError, setLastError] = useState<RefreshError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set up refresh failure callback
    const handleRefreshFailure = (error: RefreshError) => {
      setLastError(error);
      setRetryCount(tokenRefreshService.getRetryCount());
      
      // Show appropriate toast notification
      switch (error.type) {
        case RefreshErrorType.NETWORK_ERROR:
          toast.error('Network connection lost. Attempting to reconnect...', {
            duration: 5000,
            icon: <IconWifiOff className="h-4 w-4" />,
          });
          break;
          
        case RefreshErrorType.SERVER_ERROR:
          toast.error('Server temporarily unavailable. Retrying...', {
            duration: 5000,
            icon: <IconAlertTriangle className="h-4 w-4" />,
          });
          break;
          
        case RefreshErrorType.TIMEOUT:
          toast.error('Request timeout. Retrying...', {
            duration: 5000,
            icon: <IconRefresh className="h-4 w-4" />,
          });
          break;
          
        case RefreshErrorType.INVALID_TOKEN:
          toast.error('Session expired. Please log in again.', {
            duration: 8000,
            icon: <IconAlertTriangle className="h-4 w-4" />,
          });
          break;
          
        default:
          toast.error('Connection issue. Retrying...', {
            duration: 5000,
            icon: <IconAlertTriangle className="h-4 w-4" />,
          });
      }
    };

    // Set up network status monitoring
    const checkNetworkStatus = () => {
      const online = tokenRefreshService.getNetworkStatus();
      if (online !== isOnline) {
        setIsOnline(online);
        if (online) {
          toast.success('Network connection restored', {
            duration: 3000,
            icon: <IconWifi className="h-4 w-4" />,
          });
        } else {
          toast.error('Network connection lost', {
            duration: 3000,
            icon: <IconWifiOff className="h-4 w-4" />,
          });
        }
      }
    };

    // Register callbacks
    tokenRefreshService.setRefreshFailureCallback(handleRefreshFailure);
    
    // Check network status periodically
    const networkCheckInterval = setInterval(checkNetworkStatus, 5000);

    return () => {
      clearInterval(networkCheckInterval);
    };
  }, [isOnline]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    setLastError(null);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setLastError(null);
  };

  const dismissError = () => {
    setLastError(null);
  };

  // Don't render if no error or if network is offline (show different UI for offline)
  if (!lastError && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {/* Network offline notification */}
      {!isOnline && (
        <Alert className="mb-2 border-orange-200 bg-orange-50">
          <IconWifiOff className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">No Internet Connection</AlertTitle>
          <AlertDescription className="text-orange-700">
            You&apos;re currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Token refresh error notification */}
      {lastError && (
        <Alert className={`mb-2 ${
          lastError.type === RefreshErrorType.INVALID_TOKEN 
            ? 'border-red-200 bg-red-50' 
            : 'border-yellow-200 bg-yellow-50'
        }`}>
          <IconAlertTriangle className={`h-4 w-4 ${
            lastError.type === RefreshErrorType.INVALID_TOKEN 
              ? 'text-red-600' 
              : 'text-yellow-600'
          }`} />
          <AlertTitle className={
            lastError.type === RefreshErrorType.INVALID_TOKEN 
              ? 'text-red-800' 
              : 'text-yellow-800'
          }>
            {lastError.type === RefreshErrorType.INVALID_TOKEN 
              ? 'Session Expired' 
              : 'Connection Issue'}
          </AlertTitle>
          <AlertDescription className={
            lastError.type === RefreshErrorType.INVALID_TOKEN 
              ? 'text-red-700' 
              : 'text-yellow-700'
          }>
            {lastError.message}
            {lastError.retryable && retryCount > 0 && (
              <span className="block mt-1 text-sm">
                Retry attempt: {retryCount}/3
              </span>
            )}
          </AlertDescription>
          
          <div className="flex gap-2 mt-3">
            {lastError.type === RefreshErrorType.INVALID_TOKEN ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleLogout}
              >
                Log In Again
              </Button>
            ) : lastError.retryable ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
              >
                <IconRefresh className="h-3 w-3 mr-1" />
                Retry
              </Button>
            ) : null}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissError}
            >
              <IconX className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}
