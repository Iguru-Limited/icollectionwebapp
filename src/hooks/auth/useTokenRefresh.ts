// src/hooks/auth/useTokenRefresh.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { RefreshError, tokenRefreshService } from '@/lib/utils/token-refresh';

export function useTokenRefresh() {
  const { data: session, update } = useSession();
  const isInitialized = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<RefreshError | null>(null);

  useEffect(() => {
    if (!session?.user?.refresh_token || isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    // Set up error handling callbacks
    tokenRefreshService.setRefreshFailureCallback((error: RefreshError) => {
      setLastError(error);

      // Only auto-logout for non-retryable errors
      if (!error.retryable) {
        console.error('Non-retryable token refresh error, logging out:', error);
        signOut({ callbackUrl: '/login' });
      }
    });

    tokenRefreshService.setLogoutCallback(() => {
      console.log('Token refresh service requested logout');
      signOut({ callbackUrl: '/login' });
    });

    // Start the token refresh service
    tokenRefreshService.startTokenRefresh(session.user.refresh_token);

    // Set up a periodic check for token expiry with graceful degradation
    const checkTokenExpiry = async () => {
      if (!session?.user?.token) return;

      try {
        // Check if token needs refresh (within 5 minutes of expiry)
        const tokenExpiry = Date.now() + 60 * 60 * 1000; // Assuming 1 hour token lifetime
        if (tokenRefreshService.shouldRefreshToken(tokenExpiry)) {
          console.log('Token needs refresh, refreshing...');
          setIsRefreshing(true);

          if (session.user.refresh_token) {
            const newToken = await tokenRefreshService.refreshTokenWithRetry(
              session.user.refresh_token,
            );

            // Update the session with new tokens
            await update({
              token: newToken,
              refresh_token: session.user.refresh_token, // Keep the same refresh token for now
            });

            setLastError(null); // Clear any previous errors on success
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        const categorizedError = tokenRefreshService.categorizeErrorPublic(error);
        setLastError(categorizedError);

        // Only logout for non-retryable errors
        if (!categorizedError.retryable) {
          await signOut({ callbackUrl: '/login' });
        }
      } finally {
        setIsRefreshing(false);
      }
    };

    // Check token expiry every 5 minutes
    const tokenCheckInterval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      tokenRefreshService.stopTokenRefresh();
      clearInterval(tokenCheckInterval);
      isInitialized.current = false;
    };
  }, [session, update]);

  // Handle session changes
  useEffect(() => {
    if (session?.user?.refresh_token && !isInitialized.current) {
      isInitialized.current = true;
      tokenRefreshService.startTokenRefresh(session.user.refresh_token);
    } else if (!session && isInitialized.current) {
      tokenRefreshService.stopTokenRefresh();
      isInitialized.current = false;
    }
  }, [session]);

  const retryTokenRefresh = async () => {
    if (!session?.user?.refresh_token) return;

    try {
      setIsRefreshing(true);
      const newToken = await tokenRefreshService.refreshTokenWithRetry(session.user.refresh_token);

      await update({
        token: newToken,
        refresh_token: session.user.refresh_token,
      });

      setLastError(null);
    } catch (error) {
      const categorizedError = tokenRefreshService.categorizeErrorPublic(error);
      setLastError(categorizedError);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    lastActivity: tokenRefreshService.getLastActivity(),
    isInactive: tokenRefreshService.isInactive(),
    lastError,
    retryCount: tokenRefreshService.getRetryCount(),
    isOnline: tokenRefreshService.getNetworkStatus(),
    retryTokenRefresh,
  };
}
