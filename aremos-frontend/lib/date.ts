/**
 * Gemeinsame Datumsfunktionen und Konstanten für die App
 */

/**
 * Monatsnamen in Englisch
 */
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/**
 * Gibt die Anzahl der Tage in einem bestimmten Monat zurück
 * @param year Das Jahr
 * @param month Der Monat (0-basiert, Januar = 0)
 * @returns Anzahl der Tage im Monat
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Gibt den Wochentag des ersten Tags eines Monats zurück
 * @param year Das Jahr
 * @param month Der Monat (0-basiert, Januar = 0)
 * @returns Wochentag (0 = Sonntag, 1 = Montag, ..., 6 = Samstag)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * Formatiert ein Datum als ISO-String (YYYY-MM-DD)
 * @param year Das Jahr
 * @param month Der Monat (0-basiert, Januar = 0)
 * @param day Der Tag
 * @returns ISO-Datumsstring (YYYY-MM-DD)
 */
export function formatDateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/**
 * Formatiert ein Datum für die Anzeige in der App
 * @param date Das Datum als Date-Objekt oder ISO-String
 * @returns Formatiertes Datum (z.B. "15. Jan 2023")
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}
