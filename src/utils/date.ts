/**
 * Formats a Date object as YYYY-MM-DD in the user's local timezone
 * to prevent UTC offset day-shifting bugs.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date at midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Computes the whole-calendar-day difference between two dates,
 * immune to Daylight Saving Time hour shifts.
 */
export function diffCalendarDays(earlier: Date, later: Date): number {
  const utcEarlier = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const utcLater = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  return Math.round((utcLater - utcEarlier) / (1000 * 60 * 60 * 24));
}
