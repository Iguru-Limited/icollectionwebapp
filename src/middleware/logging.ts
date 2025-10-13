// src/middleware/logging.ts
import { NextRequest } from 'next/server';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  duration?: number;
  status?: number;
  error?: string;
  userId?: string;
  sessionId?: string;
}

export class RequestLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
  }

  public startRequest(request: NextRequest): LogEntry {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent');

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userAgent: userAgent || undefined,
      ip,
    };

    return logEntry;
  }

  public completeRequest(
    logEntry: LogEntry, 
    status: number, 
    startTime: number,
    userId?: string,
    error?: string
  ): void {
    logEntry.status = status;
    logEntry.duration = Date.now() - startTime;
    logEntry.userId = userId;
    logEntry.error = error;

    this.addLog(logEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logEntry.method} ${logEntry.url} - ${status} (${logEntry.duration}ms)`);
      if (error) {
        console.error(`Error: ${error}`);
      }
    }
  }

  private addLog(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Remove old logs if we exceed the limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return 'unknown';
  }

  public getLogs(limit?: number): LogEntry[] {
    const logs = [...this.logs].reverse(); // Most recent first
    return limit ? logs.slice(0, limit) : logs;
  }

  public getLogsByIP(ip: string, limit?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.ip === ip).reverse();
    return limit ? filtered.slice(0, limit) : filtered;
  }

  public getLogsByUser(userId: string, limit?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.userId === userId).reverse();
    return limit ? filtered.slice(0, limit) : filtered;
  }

  public getErrorLogs(limit?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.error || (log.status && log.status >= 400)).reverse();
    return limit ? filtered.slice(0, limit) : filtered;
  }

  public getStatistics(): {
    totalRequests: number;
    errorCount: number;
    averageResponseTime: number;
    requestsByMethod: Record<string, number>;
    requestsByStatus: Record<string, number>;
  } {
    const stats = {
      totalRequests: this.logs.length,
      errorCount: this.logs.filter(log => log.error || (log.status && log.status >= 400)).length,
      averageResponseTime: 0,
      requestsByMethod: {} as Record<string, number>,
      requestsByStatus: {} as Record<string, number>,
    };

    if (this.logs.length === 0) return stats;

    // Calculate average response time
    const validDurations = this.logs.filter(log => log.duration !== undefined);
    if (validDurations.length > 0) {
      const totalDuration = validDurations.reduce((sum, log) => sum + (log.duration || 0), 0);
      stats.averageResponseTime = Math.round(totalDuration / validDurations.length);
    }

    // Count by method
    this.logs.forEach(log => {
      stats.requestsByMethod[log.method] = (stats.requestsByMethod[log.method] || 0) + 1;
    });

    // Count by status
    this.logs.forEach(log => {
      if (log.status) {
        const statusGroup = `${Math.floor(log.status / 100)}xx`;
        stats.requestsByStatus[statusGroup] = (stats.requestsByStatus[statusGroup] || 0) + 1;
      }
    });

    return stats;
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const requestLogger = new RequestLogger();

// Utility functions for structured logging
export function logInfo(message: string, metadata?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[INFO]', message, metadata || '');
  }

  // In production, you might want to send this to a logging service
  // like Winston, Pino, or external services like Datadog, New Relic, etc.
}

export function logWarning(message: string, metadata?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[WARNING]', message, metadata || '');
  }
}

export function logError(message: string, error?: Error, metadata?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', message, error || '', metadata || '');
  }
}

export function logSecurity(
  event: string, 
  request: NextRequest, 
  metadata?: Record<string, unknown>
): void {
  const logEntry = {
    level: 'security',
    event,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('[SECURITY]', event, logEntry);
  }

  // In production, security events should be sent to a SIEM or security monitoring service
}