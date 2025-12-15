/**
 * Centralized logging utility
 * Uses Sentry in production, falls back to console in development
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isSentryEnabled: boolean;

  constructor() {
    // Check if Sentry is enabled
    this.isSentryEnabled =
      !!process.env.NEXT_PUBLIC_SENTRY_DSN &&
      (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true');
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Log to Sentry if enabled
    if (this.isSentryEnabled) {
      if (level === 'error') {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: context,
        });
      } else {
        const sentryLevel = (level === 'warn' ? 'warning' : level) as Sentry.SeverityLevel;
        Sentry.captureMessage(logMessage, {
          level: sentryLevel,
          extra: context,
        });
      }
    }

    // Always log to console for development and as fallback
    switch (level) {
      case 'error':
        console.error(logMessage, context || '');
        break;
      case 'warn':
        console.warn(logMessage, context || '');
        break;
      case 'info':
        console.info(logMessage, context || '');
        break;
      default:
        console.log(logMessage, context || '');
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? {
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name,
          }
        : { error: String(error) }),
    };

    // Capture exceptions in Sentry
    if (this.isSentryEnabled && error instanceof Error) {
      Sentry.captureException(error, {
        level: 'error',
        extra: errorContext,
      });
    }

    this.log('error', message, errorContext);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }
}

export const logger = new Logger();

