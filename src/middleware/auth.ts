// src/middleware/auth.ts
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

export interface AuthCheck {
  isAuthenticated: boolean;
  token: JWT | null;
  error?: string;
}

export class AuthMiddleware {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.NEXTAUTH_SECRET || '';
  }

  public async checkAuthentication(request: NextRequest): Promise<AuthCheck> {
    try {
      const token = await getToken({
        req: request,
        secret: this.secret,
      });

      if (!token) {
        return {
          isAuthenticated: false,
          token: null,
          error: 'No valid token found',
        };
      }

      // Check token expiration
      if (token.exp && Date.now() >= (token.exp as number) * 1000) {
        return {
          isAuthenticated: false,
          token: null,
          error: 'Token has expired',
        };
      }

      return {
        isAuthenticated: true,
        token,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        token: null,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      };
    }
  }

  public async checkRole(request: NextRequest, requiredRole: string): Promise<boolean> {
    const authCheck = await this.checkAuthentication(request);
    
    if (!authCheck.isAuthenticated || !authCheck.token) {
      return false;
    }

    const userRole = authCheck.token.role as string;
    return userRole === requiredRole || userRole === 'admin';
  }

  public async checkPermission(request: NextRequest, requiredPermission: string): Promise<boolean> {
    const authCheck = await this.checkAuthentication(request);
    
    if (!authCheck.isAuthenticated || !authCheck.token) {
      return false;
    }

    // Check if user has specific permission
    const permissions = authCheck.token.permissions as string[] || [];
    return permissions.includes(requiredPermission) || permissions.includes('all');
  }

  public extractUserInfo(token: JWT): {
    username: string;
    company: {
      company_id: number;
      company_name: string;
      iguru_id: string;
    } | null;
    role: string;
  } | null {
    if (!token || !token.user) {
      return null;
    }

    const user = token.user as {
      username?: string;
      company?: {
        company_id: number;
        company_name: string;
        iguru_id: string;
      };
    };
    
    return {
      username: user.username || '',
      company: user.company || null,
      role: token.role as string || 'user',
    };
  }
}

export const authMiddleware = new AuthMiddleware();

// Route-based permission mapping
export const ROUTE_PERMISSIONS = {
  '/user': ['user.read'],
  '/user/collection': ['collection.read', 'collection.write'],
  '/debug': ['debug.access'],
  '/api/user': ['user.api'],
  '/api/collection': ['collection.api'],
} as const;

export function getRequiredPermissions(pathname: string): string[] {
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return [...permissions];
    }
  }
  return [];
}

export function createAuthErrorResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      error: 'Authentication required',
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
      },
    }
  );
}