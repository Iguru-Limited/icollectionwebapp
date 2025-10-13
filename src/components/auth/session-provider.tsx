// src/components/auth/session-provider.tsx
"use client";

import { SessionProvider } from 'next-auth/react';
import { useTokenRefresh } from '@/hooks/auth/useTokenRefresh';
import { ReactNode } from 'react';
import { TokenRefreshNotifications } from './token-refresh-notifications';

interface AuthSessionProviderProps {
  children: ReactNode;
}

function TokenRefreshWrapper({ children }: { children: ReactNode }) {
  // This hook will handle automatic token refresh
  const { retryTokenRefresh } = useTokenRefresh();
  
  return (
    <>
      <TokenRefreshNotifications 
        onRetry={retryTokenRefresh}
        onLogout={() => window.location.href = '/login'}
      />
      {children}
    </>
  );
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  return (
    <SessionProvider>
      <TokenRefreshWrapper>
        {children}
      </TokenRefreshWrapper>
    </SessionProvider>
  );
}