export const TZ = 'Europe/Berlin' as const;
export function todayStrBerlin(d: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(d);
}
export function toBerlinDateStr(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(d);
}
