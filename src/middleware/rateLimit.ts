// src/middleware/rateLimit.ts
import { NextRequest } from 'next/server';
import { getClientIP } from './config';

export interface RateLimitStore {
  count: number;
  resetTime: number;
  blocked?: boolean;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>();

// Cleanup interval to remove expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyGenerator: (request: NextRequest) => string;

  constructor(
    windowMs: number = 15 * 60 * 1000,
    maxRequests: number = 100,
    keyGenerator?: (request: NextRequest) => string
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.keyGenerator = keyGenerator || this.defaultKeyGenerator;
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = getClientIP(request);
    const pathname = request.nextUrl.pathname;
    return `rate_limit:${ip}:${pathname}`;
  }

  public check(request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    total: number;
  } {
    const key = this.keyGenerator(request);
    const now = Date.now();
    const resetTime = now + this.windowMs;

    // Get current rate limit data
    let current = rateLimitStore.get(key);

    if (!current || current.resetTime <= now) {
      // Reset or initialize counter
      current = { count: 1, resetTime };
      rateLimitStore.set(key, current);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
        total: this.maxRequests,
      };
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        total: this.maxRequests,
      };
    }

    // Increment counter
    current.count++;

    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetTime: current.resetTime,
      total: this.maxRequests,
    };
  }

  public reset(request: NextRequest): void {
    const key = this.keyGenerator(request);
    rateLimitStore.delete(key);
  }

  public getStatus(request: NextRequest): RateLimitStore | undefined {
    const key = this.keyGenerator(request);
    return rateLimitStore.get(key);
  }
}

// Pre-configured rate limiters
export const defaultRateLimiter = new RateLimiter(15 * 60 * 1000, 100);
export const apiRateLimiter = new RateLimiter(15 * 60 * 1000, 50);
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // Stricter for auth endpoints

export function createRateLimitResponse(
  remaining: number,
  resetTime: number,
  total: number
) {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': total.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}