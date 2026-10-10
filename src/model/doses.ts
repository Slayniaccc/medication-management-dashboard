import { isInForce } from "./schedules";
import { wallClockDate } from "./time";
import type { LocalDate } from "./time";
import type { DoseEvent, DoseStatus, Occurrence, OccurrenceKey, Schedule } from "./types";

/**
 * The occurrence key as one string, for lookups and as a storage key. Date and
 * slot are fixed width and come first, so the result is unambiguous whatever
 * the medication id contains and sorts in time order.
 */
export function occurrenceKey({ medicationId, date, timeOfDay }: OccurrenceKey): string {
  return `${date}T${timeOfDay}/${medicationId}`;
}

/**
 * Records an event against its occurrence. Idempotent: writing the same
 * occurrence again replaces what was there rather than adding a duplicate.
 * Returns a new list.
 */
export function recordDose(events: readonly DoseEvent[], event: DoseEvent): DoseEvent[] {
  const key = occurrenceKey(event);
  return [...events.filter((existing) => occurrenceKey(existing) !== key), event];
}

/**
 * The doses for one date: every slot of every schedule in force on that date,
 * each matched with its event if one was recorded. Sorted by time of day.
 *
 * An event whose slot no schedule in force accounts for is still returned, so
 * something that was recorded never drops out of the day it belongs to.
 */
export function occurrencesOn(
  date: LocalDate,
  schedules: readonly Schedule[],
  events: readonly DoseEvent[],
): Occurrence[] {
  const recorded = new Map<string, DoseEvent>();
  for (const event of events) {
    if (event.date === date) recorded.set(occurrenceKey(event), event);
  }

  const occurrences = new Map<string, Occurrence>();
  for (const schedule of schedules) {
    if (!isInForce(schedule, date)) continue;
    const { medicationId, timeOfDay } = schedule;
    const key = occurrenceKey({ medicationId, date, timeOfDay });
    if (occurrences.has(key)) continue;
    occurrences.set(key, {
      medicationId,
      date,
      timeOfDay,
      scheduleId: schedule.id,
      event: recorded.get(key) ?? null,
    });
  }
  for (const [key, event] of recorded) {
    if (occurrences.has(key)) continue;
    const { medicationId, timeOfDay } = event;
    occurrences.set(key, { medicationId, date, timeOfDay, scheduleId: null, event });
  }

  return [...occurrences.values()].sort((a, b) => {
    if (a.timeOfDay !== b.timeOfDay) return a.timeOfDay < b.timeOfDay ? -1 : 1;
    return a.medicationId < b.medicationId ? -1 : a.medicationId > b.medicationId ? 1 : 0;
  });
}

export type DueWindow = {
  /** Minutes before the scheduled time at which a dose becomes due soon. */
  dueSoonMinutes: number;
  /** Minutes after the scheduled time at which an unrecorded dose becomes overdue. */
  overdueMinutes: number;
};

export const defaultDueWindow: DueWindow = { dueSoonMinutes: 30, overdueMinutes: 60 };

/**
 * Where a dose stands at a given moment. A recorded dose reports its outcome.
 * An unrecorded one is placed by the clock alone, so nothing is stored and
 * nothing needs ticking over.
 */
export function doseStatus(
  occurrence: Occurrence,
  now: Date,
  window: DueWindow = defaultDueWindow,
): DoseStatus {
  if (occurrence.event) return occurrence.event.outcome;
  const scheduled = wallClockDate(occurrence.date, occurrence.timeOfDay).getTime();
  const minutesPast = (now.getTime() - scheduled) / 60_000;
  if (minutesPast >= window.overdueMinutes) return "overdue";
  if (minutesPast >= -window.dueSoonMinutes) return "due-soon";
  return "pending";
}

/**
 * Whole minutes between the scheduled time and when the event was logged.
 * Negative when it was logged ahead of the slot.
 */
export function minutesAfterScheduled(event: DoseEvent): number {
  const scheduled = wallClockDate(event.date, event.timeOfDay).getTime();
  return Math.round((Date.parse(event.recordedAt) - scheduled) / 60_000);
}
