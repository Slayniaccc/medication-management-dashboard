// Two kinds of time, kept apart on purpose. A schedule lives on the wall clock:
// 8am means 8am whatever the clocks are doing. A record of something that
// happened is an instant, stored as UTC.

/** A calendar date on the wall clock, "YYYY-MM-DD". Compares correctly as a string. */
export type LocalDate = `${number}-${number}-${number}`;

/** A time of day on the wall clock, 24-hour "HH:MM". Compares correctly as a string. */
export type TimeOfDay = `${number}:${number}`;

/** A point in time as an ISO 8601 UTC string, as produced by `Date.toISOString()`. */
export type Instant = `${string}Z`;

const pad = (value: number) => String(value).padStart(2, "0");

export function isLocalDate(value: string): value is LocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isTimeOfDay(value: string): value is TimeOfDay {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** The wall clock date showing on this device at the given moment. */
export function localDateOf(at: Date): LocalDate {
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` as LocalDate;
}

export function toInstant(at: Date): Instant {
  return at.toISOString() as Instant;
}

/**
 * The moment a wall clock date and time falls on, in this device's time zone.
 * Derived for display, sorting and comparing against now. Never stored.
 */
export function wallClockDate(date: LocalDate, timeOfDay: TimeOfDay): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}
