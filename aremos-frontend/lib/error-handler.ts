"use client"

/**
 * Zentrale Fehlerbehandlung für AREMOS
 * 
 * Diese Datei stellt Funktionen zur Fehlerbehandlung bereit,
 * um console.error-Aufrufe durch eine zentrale Fehlerbehandlung zu ersetzen.
 */

// Types for error handling
type ErrorSeverity = 'error' | 'warning' | 'info';
type ErrorSource = 'api' | 'ui' | 'auth' | 'data' | 'upload' | 'unknown';

// Interface for error handler options
interface LogErrorOptions {
  context?: string;
  severity?: ErrorSeverity;
  source?: ErrorSource;
  showToUser?: boolean;
  additionalInfo?: Record<string, any>;
}

/**
 * Zentrales Error-Logging
 */
export function logError(
  error: unknown,
  options: LogErrorOptions = {}
): void {
  const {
    context = 'allgemein',
    severity = 'error',
    source = 'unknown',
    showToUser = false,
    additionalInfo = {},
  } = options;

  // Formatiere die Fehlermeldung
  const errorObject = formatError(error);
  
  // Add metadata
  const enrichedError = {
    ...errorObject,
    timestamp: new Date().toISOString(),
    context,
    severity,
    source,
    additionalInfo,
  };
  
  // Log to console (in production this could be sent to a server)
  if (process.env.NODE_ENV === 'development') {
    console.group(`[${severity.toUpperCase()}] ${source}: ${context}`);
    console.error(enrichedError);
    console.groupEnd();
  } else {
    // In production mode we could send the error to a logging service
    // or perform other actions
    console.error(`[${severity}] ${source}:${context}:`, errorObject.message);
  }
  
  // Optional: Zeige dem Benutzer eine Benachrichtigung
  if (showToUser) {
    showErrorToUser(errorObject.message);
  }
}

/**
 * Formatiert einen Fehler in ein einheitliches Format
 */
function formatError(error: unknown): { message: string; originalError: unknown } {
  if (error instanceof Error) {
    return { 
      message: error.message || 'Ein unbekannter Fehler ist aufgetreten',
      originalError: error,
    };
  } else if (typeof error === 'string') {
    return { 
      message: error,
      originalError: new Error(error),
    };
  } else {
    return {
      message: 'Ein unbekannter Fehler ist aufgetreten',
      originalError: error,
    };
  }
}

/**
 * Zeigt dem Benutzer eine Fehlermeldung an
 */
function showErrorToUser(message: string): void {
  // In a real application this would show a toast message or dialog
  // For now we use alert, but this should be replaced with a better UI component
  alert(message);
}

/**
 * Spezialisierte Fehlerbehandlungsfunktionen
 */
export function logApiError(error: unknown, context: string, showToUser = false, additionalInfo = {}): void {
  logError(error, { 
    context, 
    severity: 'error', 
    source: 'api', 
    showToUser,
    additionalInfo,
  });
}

export function logAuthError(error: unknown, context: string, showToUser = false): void {
  logError(error, { 
    context, 
    severity: 'error', 
    source: 'auth', 
    showToUser,
  });
}

export function logDataError(error: unknown, context: string, showToUser = false): void {
  logError(error, { 
    context, 
    severity: 'error', 
    source: 'data', 
    showToUser,
  });
}

export function logUIWarning(error: unknown, context: string): void {
  logError(error, { 
    context, 
    severity: 'warning', 
    source: 'ui', 
    showToUser: false,
  });
}

export function logUploadError(error: unknown, context: string, showToUser = true): void {
  logError(error, { 
    context, 
    severity: 'error', 
    source: 'upload', 
    showToUser,
  });
}
