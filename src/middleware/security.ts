// src/middleware/security.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS, CSP_CONFIG, SecurityConfig } from './config';

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  public applySecurityHeaders(response: NextResponse): NextResponse {
    // Apply standard security headers
    if (this.config.enableFrameGuard) {
      response.headers.set('X-Frame-Options', SECURITY_HEADERS['X-Frame-Options']);
    }

    if (this.config.enableContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', SECURITY_HEADERS['X-Content-Type-Options']);
    }

    if (this.config.enableXSSProtection) {
      response.headers.set('X-XSS-Protection', SECURITY_HEADERS['X-XSS-Protection']);
    }

    if (this.config.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', SECURITY_HEADERS['Referrer-Policy']);
    }

    // Apply additional security headers
    response.headers.set('X-DNS-Prefetch-Control', SECURITY_HEADERS['X-DNS-Prefetch-Control']);
    response.headers.set('X-Download-Options', SECURITY_HEADERS['X-Download-Options']);

    // Apply HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
    }

    // Apply CSP
    if (this.config.enableCSP) {
      const csp = this.buildCSP();
      response.headers.set('Content-Security-Policy', csp);
    }

    return response;
  }

  private buildCSP(): string {
    const cspParts: string[] = [];
    
    for (const [directive, value] of Object.entries(CSP_CONFIG)) {
      if (value) {
        cspParts.push(`${directive} ${value}`);
      } else {
        cspParts.push(directive);
      }
    }

    return cspParts.join('; ');
  }

  public validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
    const origin = request.headers.get('origin');
    
    if (!origin) {
      // Allow same-origin requests (no origin header)
      return true;
    }

    return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }

  public handleCORS(request: NextRequest, allowedOrigins: string[], allowedMethods: string[], allowedHeaders: string[]): NextResponse | null {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
      
      return response;
    }

    return null;
  }
}

export function detectSuspiciousActivity(request: NextRequest): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let isSuspicious = false;

  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // Check for common bot patterns
  const suspiciousBots = [
    'curl', 'wget', 'python', 'bot', 'crawler', 'spider',
    'scraper', 'scanner', 'nikto', 'sqlmap', 'nmap'
  ];

  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    reasons.push('Suspicious user agent detected');
    isSuspicious = true;
  }

  // Check for common attack patterns in URL
  const attackPatterns = [
    '../', '..\\', '<script', 'javascript:', 'data:',
    'union select', 'drop table', 'insert into', 'delete from',
    '%3Cscript', '%3C%2Fscript%3E', 'eval(', 'alert(',
  ];

  if (attackPatterns.some(pattern => pathname.toLowerCase().includes(pattern))) {
    reasons.push('Potential injection attack in URL');
    isSuspicious = true;
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = [
    '.php', '.asp', '.jsp', '.cgi', '.pl', '.py', '.rb',
    '.sh', '.bat', '.exe', '.dll', '.so'
  ];

  if (suspiciousExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
    reasons.push('Suspicious file extension requested');
    isSuspicious = true;
  }

  // Check for directory traversal attempts
  if (pathname.includes('../') || pathname.includes('..\\')) {
    reasons.push('Directory traversal attempt detected');
    isSuspicious = true;
  }

  return { isSuspicious, reasons };
}

export function createSecurityResponse(message: string, status: number = 403): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Security violation',
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}