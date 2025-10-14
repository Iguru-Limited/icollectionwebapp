// src/lib/utils/session-utils.ts

/**
 * Utility functions for session management and timeout handling
 */

import type { Session } from "next-auth";

type ExpiryInput = Session | number | Date | string | null | undefined;

function isSessionObject(value: unknown): value is Session {
  return (
    typeof value === 'object' &&
    value !== null &&
    'expires' in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>).expires === 'string'
  );
}

function toExpiryMs(input: ExpiryInput): number | null {
  if (!input) return null;
  // If Session object, use session.expires
  if (isSessionObject(input)) {
    const exp = input.expires;
    return exp ? new Date(exp).getTime() : null;
  }
  // If Date
  if (input instanceof Date) {
    return input.getTime();
  }
  // If number (already ms or seconds?) Assume ms if large, else seconds
  if (typeof input === 'number') {
    // Heuristic: treat values < 10^12 as seconds (since ms since epoch ~ 1.7e12 in 2025)
    return input < 1_000_000_000_000 ? input * 1000 : input;
  }
  // If string (timestamp or ISO date)
  if (typeof input === 'string') {
    const n = Number(input);
    if (!Number.isNaN(n)) {
      return n < 1_000_000_000_000 ? n * 1000 : n;
    }
    const t = Date.parse(input);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

/**
 * Get the time until session expiry in milliseconds
 * @param session - NextAuth session object
 * @returns Time until expiry in milliseconds, or 0 if expired/invalid
 */
export function getTimeUntilExpiry(input: ExpiryInput): number {
  const expiryTime = toExpiryMs(input);
  if (!expiryTime) {
    return 0;
  }
  const currentTime = Date.now();
  const timeRemaining = expiryTime - currentTime;

  return Math.max(0, timeRemaining);
}

/**
 * Check if a session is expired
 * @param session - NextAuth session object
 * @returns True if session is expired or invalid
 */
export function isSessionExpired(input: ExpiryInput): boolean {
  const expiryTime = toExpiryMs(input);
  if (!expiryTime) return true;
  return expiryTime <= Date.now();
}

/**
 * Format time remaining into a human-readable string
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted time string (e.g., "5m 30s", "2h 15m", "Expired")
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate session expiry warning thresholds
 * @param session - NextAuth session object
 * @returns Object with warning states
 */
export function getSessionWarningState(session: Session | null): {
  isExpired: boolean;
  isCritical: boolean; // Less than 5 minutes
  isWarning: boolean;  // Less than 15 minutes
  timeRemaining: number;
} {
  const timeRemaining = getTimeUntilExpiry(session);
  const isExpired = timeRemaining <= 0;
  const isCritical = timeRemaining <= 5 * 60 * 1000; // 5 minutes
  const isWarning = timeRemaining <= 15 * 60 * 1000; // 15 minutes

  return {
    isExpired,
    isCritical: !isExpired && isCritical,
    isWarning: !isExpired && !isCritical && isWarning,
    timeRemaining,
  };
}

/**
 * Get session expiry as a Date object
 * @param session - NextAuth session object
 * @returns Date object of session expiry, or null if invalid
 */
export function getSessionExpiryDate(session: Session | null): Date | null {
  if (!session?.expires) {
    return null;
  }

  return new Date(session.expires);
}

/**
 * Calculate the percentage of session time remaining
 * @param session - NextAuth session object
 * @param sessionDuration - Total session duration in milliseconds (default: 24 hours)
 * @returns Percentage of time remaining (0-100)
 */
export function getSessionTimePercentage(
  session: Session | null,
  sessionDuration: number = 24 * 60 * 60 * 1000 // 24 hours default
): number {
  const timeRemaining = getTimeUntilExpiry(session);
  
  if (timeRemaining <= 0) {
    return 0;
  }

  const percentage = (timeRemaining / sessionDuration) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Create a session refresh timer callback
 * @param callback - Function to call when refresh is needed
 * @param thresholdMinutes - Minutes before expiry to trigger refresh (default: 10)
 * @returns Timer ID for cleanup
 */
export function createSessionRefreshTimer(
  session: Session | null,
  callback: () => void,
  thresholdMinutes: number = 10
): NodeJS.Timeout | null {
  const timeRemaining = getTimeUntilExpiry(session);
  const thresholdMs = thresholdMinutes * 60 * 1000;

  if (timeRemaining <= thresholdMs) {
    // If we're already within the threshold, trigger immediately
    callback();
    return null;
  }

  const delayUntilRefresh = timeRemaining - thresholdMs;
  return setTimeout(callback, delayUntilRefresh);
}

/**
 * Format session expiry for display
 * @param session - NextAuth session object
 * @returns Formatted expiry string
 */
export function formatSessionExpiry(session: Session | null): string {
  const expiryDate = getSessionExpiryDate(session);
  
  if (!expiryDate) {
    return "Unknown";
  }

  return expiryDate.toLocaleString();
}

/**
 * Check if session should be refreshed
 * @param session - NextAuth session object
 * @param refreshThresholdMinutes - Minutes before expiry to refresh (default: 15)
 * @returns True if session should be refreshed
 */
export function shouldRefreshSession(
  session: Session | null,
  refreshThresholdMinutes: number = 15
): boolean {
  const timeRemaining = getTimeUntilExpiry(session);
  const thresholdMs = refreshThresholdMinutes * 60 * 1000;

  return timeRemaining > 0 && timeRemaining <= thresholdMs;
}