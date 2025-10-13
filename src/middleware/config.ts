// src/middleware/config.ts
import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  apiMaxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface SecurityConfig {
  enableCSP: boolean;
  enableFrameGuard: boolean;
  enableXSSProtection: boolean;
  enableContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
}

export interface MiddlewareConfig {
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
}

// Default configuration
export const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    apiMaxRequests: 50,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  security: {
    enableCSP: true,
    enableFrameGuard: true,
    enableXSSProtection: true,
    enableContentTypeOptions: true,
    enableReferrerPolicy: true,
  },
  cors: {
    allowedOrigins: ['http://localhost:3000', 'https://icollections.onrender.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
};

// Route patterns
export const ROUTE_PATTERNS = {
  AUTH: ['/login', '/otp'],
  PROTECTED: ['/user', '/collection', '/debug'],
  API: ['/api'],
  PUBLIC_API: ['/api/auth', '/api/health'],
  STATIC: ['/_next/static', '/static', '/favicon.ico', '/public'],
} as const;

// Security headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// CSP configuration
export const CSP_CONFIG = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-eval' 'unsafe-inline'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https://icollections.onrender.com",
  'media-src': "'self'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'",
  'upgrade-insecure-requests': '',
} as const;

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'anonymous';
}

export function isStaticFile(pathname: string): boolean {
  return ROUTE_PATTERNS.STATIC.some(pattern => pathname.startsWith(pattern)) ||
         (pathname.includes('.') && !pathname.startsWith('/api/'));
}

export function matchesRoutePattern(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => pathname.startsWith(pattern));
}