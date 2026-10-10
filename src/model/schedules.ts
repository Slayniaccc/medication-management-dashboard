import type { LocalDate, TimeOfDay } from "./time";
import type { Schedule } from "./types";

export function isInForce(schedule: Schedule, date: LocalDate): boolean {
  return schedule.startDate <= date && (schedule.endDate === null || date < schedule.endDate);
}

/**
 * Ends an open schedule so that `from` is the first date it no longer applies.
 * Returns a new list; the schedules passed in are left untouched.
 */
export function closeSchedule(
  schedules: readonly Schedule[],
  scheduleId: string,
  from: LocalDate,
): Schedule[] {
  const current = schedules.find((schedule) => schedule.id === scheduleId);
  if (!current) throw new RangeError(`No schedule with id ${scheduleId}`);
  if (current.endDate !== null) throw new RangeError(`Schedule ${scheduleId} has already ended`);
  if (from < current.startDate) {
    throw new RangeError(`Schedule ${scheduleId} cannot end before it starts`);
  }
  return schedules.map((schedule) =>
    schedule === current ? { ...schedule, endDate: from } : schedule,
  );
}

/**
 * Changes a schedule from a given date by closing the current one and adding a
 * new one that starts where it ended. Dates before `from` keep resolving
 * through the old schedule, so events recorded against its slot still match.
 */
export function supersedeSchedule(
  schedules: readonly Schedule[],
  scheduleId: string,
  replacement: { id: string; timeOfDay: TimeOfDay },
  from: LocalDate,
): Schedule[] {
  const closed = closeSchedule(schedules, scheduleId, from);
  const previous = closed.find((schedule) => schedule.id === scheduleId)!;
  return [
    ...closed,
    {
      id: replacement.id,
      medicationId: previous.medicationId,
      timeOfDay: replacement.timeOfDay,
      startDate: from,
      endDate: null,
    },
  ];
}
