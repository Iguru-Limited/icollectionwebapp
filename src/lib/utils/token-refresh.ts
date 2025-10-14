// src/lib/token-refresh.ts
"use client";

import { TokenRefreshRequest, TokenRefreshResponse } from '@/types/auth/userauthentication';
import { API_ENDPOINTS } from './constants';

export enum RefreshErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface RefreshError {
  type: RefreshErrorType;
  message: string;
  retryable: boolean;
  originalError?: unknown;
}

export class TokenRefreshService {
  private static instance: TokenRefreshService;
  private refreshPromise: Promise<string> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private isOnline: boolean = true;
  private refreshFailureCallback?: (error: RefreshError) => void;
  private logoutCallback?: () => void;

  // Session timeout: 6 hours
  private readonly SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  // Inactivity timeout: 1 hour
  private readonly INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Token refresh interval: 60 minutes
  private readonly REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds
  
  // Retry delay: exponential backoff starting at 5 seconds
  private readonly RETRY_DELAY_BASE = 5000; // 5 seconds

  private constructor() {
    this.setupActivityTracking();
    this.setupNetworkDetection();
  }

  public static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  /**
   * Setup network connectivity detection
   */
  private setupNetworkDetection(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Initial state
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.isOnline = false;
    });
  }

  /**
   * Categorize refresh errors for better handling
   */
  private categorizeError(error: unknown): RefreshError {
    if (!error) {
      return {
        type: RefreshErrorType.UNKNOWN,
        message: 'Unknown error occurred',
        retryable: false,
        originalError: error
      };
    }

    // Network errors
    if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: RefreshErrorType.NETWORK_ERROR,
        message: 'Network connection error',
        retryable: true,
        originalError: error
      };
    }

    // Timeout errors
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      return {
        type: RefreshErrorType.TIMEOUT,
        message: 'Request timeout',
        retryable: true,
        originalError: error
      };
    }

    // HTTP status errors
    if (error instanceof Error && error.message && error.message.includes('Token refresh failed:')) {
      const statusMatch = error.message.match(/\d+/);
      if (statusMatch) {
        const status = parseInt(statusMatch[0]);
        
        if (status === 401 || status === 403) {
          return {
            type: RefreshErrorType.INVALID_TOKEN,
            message: 'Invalid or expired refresh token',
            retryable: false,
            originalError: error
          };
        }
        
        if (status >= 500) {
          return {
            type: RefreshErrorType.SERVER_ERROR,
            message: 'Server error occurred',
            retryable: true,
            originalError: error
          };
        }
      }
    }

    // Default categorization
    return {
      type: RefreshErrorType.UNKNOWN,
      message: (error instanceof Error ? error.message : 'Unknown error occurred') || 'Unknown error occurred',
      retryable: true,
      originalError: error
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(): number {
    return this.RETRY_DELAY_BASE * Math.pow(2, this.retryCount);
  }

  /**
   * Setup activity tracking to detect user inactivity
   */
  private setupActivityTracking(): void {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Also track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateActivity();
      }
    });
  }

  /**
   * Reset the inactivity timer
   */
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Handle inactivity timeout - logout user
   */
  private handleInactivityTimeout(): void {
    console.log('User inactive for 1 hour, logging out...');
    this.logout();
  }

  /**
   * Check if session has expired (6 hours)
   */
  private isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.SESSION_TIMEOUT;
  }

  /**
   * Start the automatic token refresh process
   */
  public startTokenRefresh(refreshToken: string): void {
    console.log('Starting automatic token refresh...');
    
    // Clear any existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Reset retry count
    this.retryCount = 0;

    // Set up periodic token refresh
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshTokenWithRetry(refreshToken);
        this.retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('Automatic token refresh failed after all retries:', error);
        this.handleRefreshFailure(error);
      }
    }, this.REFRESH_INTERVAL);

    // Reset inactivity timer
    this.resetInactivityTimer();
  }

  /**
   * Stop the token refresh process
   */
  public stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Refresh token with retry logic
   */
  public async refreshTokenWithRetry(refreshToken: string): Promise<string> {
    // If offline, don't attempt refresh
    if (!this.isOnline) {
      throw new Error('Network is offline');
    }

    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefreshWithRetry(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform token refresh with retry logic
   */
  private async performTokenRefreshWithRetry(refreshToken: string): Promise<string> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Token refresh attempt ${attempt + 1}/${this.maxRetries + 1}`);
        const result = await this.performTokenRefresh(refreshToken);
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error) {
        lastError = error;
        const categorizedError = this.categorizeError(error);
        
        console.warn(`Token refresh attempt ${attempt + 1} failed:`, categorizedError);

        // If not retryable or max retries reached, break
        if (!categorizedError.retryable || attempt >= this.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = this.getRetryDelay();
        console.log(`Retrying token refresh in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Handle refresh failure with appropriate action
   */
  private handleRefreshFailure(error: unknown): void {
    const categorizedError = this.categorizeError(error);
    
    // Notify callback if set
    if (this.refreshFailureCallback) {
      this.refreshFailureCallback(categorizedError);
    }

    // Only logout for non-retryable errors or after all retries exhausted
    if (!categorizedError.retryable || this.retryCount >= this.maxRetries) {
      console.error('Token refresh failed permanently, logging out:', categorizedError);
      this.logout();
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Refresh the access token using the refresh token (legacy method for compatibility)
   */
  public async refreshToken(refreshToken: string): Promise<string> {
    return this.refreshTokenWithRetry(refreshToken);
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      console.log('Refreshing token...');
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        } as TokenRefreshRequest),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data: TokenRefreshResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error('Token refresh failed: Invalid response status');
      }

      console.log('Token refreshed successfully');
      
      // Update the session with new tokens
      await this.updateSessionTokens(data.token, data.refresh_token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Update the session with new tokens
   * This will be handled by the useTokenRefresh hook using NextAuth's update function
   */
  private async updateSessionTokens(newToken: string, newRefreshToken: string): Promise<void> {
    // This method is kept for compatibility but the actual update
    // is handled by the useTokenRefresh hook using NextAuth's update function
    console.log('Token refresh completed:', { newToken: newToken.substring(0, 20) + '...', newRefreshToken: newRefreshToken.substring(0, 20) + '...' });
  }

  /**
   * Logout the user
   */
  private logout(): void {
    this.stopTokenRefresh();
    
    // Only redirect in browser environment
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Check if token needs refresh (within 5 minutes of expiry)
   */
  public shouldRefreshToken(tokenExpiry: number): boolean {
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() + fiveMinutes >= tokenExpiry;
  }

  /**
   * Get the last activity timestamp
   */
  public getLastActivity(): number {
    return this.lastActivity;
  }

  /**
   * Check if user is inactive
   */
  public isInactive(): boolean {
    return Date.now() - this.lastActivity > this.INACTIVITY_TIMEOUT;
  }

  /**
   * Set callback for refresh failure notifications
   */
  public setRefreshFailureCallback(callback: (error: RefreshError) => void): void {
    this.refreshFailureCallback = callback;
  }

  /**
   * Set callback for logout notifications
   */
  public setLogoutCallback(callback: () => void): void {
    this.logoutCallback = callback;
  }

  /**
   * Get current retry count
   */
  public getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * Get network status
   */
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get error categorization for external use
   */
  public categorizeErrorPublic(error: unknown): RefreshError {
    return this.categorizeError(error);
  }
}

// Export singleton instance
export const tokenRefreshService = TokenRefreshService.getInstance();
