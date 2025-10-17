"use client"

/**
 * Zeitzone-Utilities für AREMOS
 * 
 * Alle Datumsoperationen verwenden Europa/Berlin Zeitzone
 * gemäß Spezifikation für 24h/48h Logik
 */

// Zeitzone konstant
export const AREMOS_TIMEZONE = 'Europe/Berlin';

/**
 * Gibt das aktuelle Datum in Europa/Berlin Zeitzone zurück
 */
export function getCurrentDateBerlin(): Date {
  return new Date(new Intl.DateTimeFormat('en-CA', {
    timeZone: AREMOS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()) + 'T00:00:00');
}

/**
 * Formatiert ein Datum für Europa/Berlin Zeitzone
 */
export function formatDateBerlin(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: AREMOS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Prüft ob ein Datum heute in Europa/Berlin ist (24h Regel)
 */
export function isToday(date: Date | string): boolean {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const today = getCurrentDateBerlin();
  
  const inputDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: AREMOS_TIMEZONE
  }).format(inputDate);
  
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: AREMOS_TIMEZONE
  }).format(today);
  
  return inputDateStr === todayStr;
}

/**
 * Prüft ob ein Datum innerhalb der letzten 48h in Europa/Berlin liegt
 */
export function isWithin48Hours(date: Date | string): boolean {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
  
  return inputDate >= fortyEightHoursAgo && inputDate <= now;
}

/**
 * Erstellt einen neuen Zeitstempel in Europa/Berlin
 */
export function createBerlinTimestamp(): string {
  return new Date().toLocaleString('sv-SE', { 
    timeZone: AREMOS_TIMEZONE 
  }).replace(' ', 'T') + 'Z';
}

/**
 * Konvertiert ISO-String zu Europa/Berlin Datum
 */
export function parseISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Gibt den Tagesbeginn (00:00) für ein Datum in Europa/Berlin zurück
 */
export function getStartOfDay(date: Date): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: AREMOS_TIMEZONE
  }).format(date);
  
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Gibt das Tagesende (23:59:59) für ein Datum in Europa/Berlin zurück
 */
export function getEndOfDay(date: Date): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: AREMOS_TIMEZONE
  }).format(date);
  
  return new Date(dateStr + 'T23:59:59');
}
