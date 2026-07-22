import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';

export const QUEBEC_TIMEZONE = 'America/Toronto';

/**
 * Returns a Date object representing the midnight (00:00:00) of the current day
 * in the Quebec timezone. When compared with UTC dates in the database, this
 * ensures the "start of today" accurately reflects EST/EDT midnight.
 */
export function getQuebecMidnight(): Date {
  const now = new Date();
  
  // Convert current UTC time to Quebec time to know what day it currently is there
  const quebecTime = toZonedTime(now, QUEBEC_TIMEZONE);
  
  // Get midnight of that day in Quebec time
  const quebecMidnight = startOfDay(quebecTime);
  
  // Convert back to a UTC Date object
  return fromZonedTime(quebecMidnight, QUEBEC_TIMEZONE);
}

/**
 * Returns a YYYY-MM-DD string for the given Date based on Quebec time.
 * Replaces .toISOString().split('T')[0] which yields incorrect dates around the .
 */
export function getQuebecDateString(date: Date = new Date()): string {
  return date.toLocaleDateString('fr-CA', { 
    timeZone: QUEBEC_TIMEZONE, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
}

/**
 * Helper to get a string formatted date specifically for Quebec
 */
export function formatToQuebecDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-CA', { timeZone: QUEBEC_TIMEZONE, ...options });
}

export function formatToQuebecTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fr-CA', { timeZone: QUEBEC_TIMEZONE, ...options });
}
