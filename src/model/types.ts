import type { Instant, LocalDate, TimeOfDay } from "./time";

/** A semantic colour token name, never a class or a hex value. */
export type MedicationColour = "coral" | "teal" | "ochre" | "indigo";

/**
 * A definition. It has no relationship to time: nothing here says when a dose
 * is due or whether one was given.
 */
export type Medication = {
  id: string;
  name: string;
  purpose: string;
  strength: string;
  form: string;
  /** The prescription's instructions as the carer entered them. A record, not the app's advice. */
  instructions: string;
  carerNotes: string;
  colour: MedicationColour;
  imageUrl?: string;
};

/**
 * Intent: one medication, at one time of day, every day over a date range.
 *
 * Never updated in place apart from being closed. To change a schedule, use
 * `supersedeSchedule`, so past dates keep resolving through the schedule that
 * was in force on them.
 */
export type Schedule = {
  id: string;
  medicationId: string;
  timeOfDay: TimeOfDay;
  /** First date the schedule is in force. */
  startDate: LocalDate;
  /** First date the schedule is no longer in force, or null while it is open. */
  endDate: LocalDate | null;
};

/**
 * Identifies one scheduled dose by the human-meaningful thing: which medicine,
 * on which local date, in which slot. A natural key, so a second write for the
 * same dose lands on the same record.
 */
export type OccurrenceKey = {
  medicationId: string;
  date: LocalDate;
  timeOfDay: TimeOfDay;
};

/** Whether the dose was given. Why not is a separate field. */
export type Outcome = "given" | "not-given";

export type NotGivenReason =
  | "refused"
  | "asleep"
  | "unwell"
  | "unavailable"
  | "withheld-on-clinical-advice"
  | "carer-unable"
  | "other";

export type RecordedBy = "carer" | "patient";

/**
 * A record of something that happened to one scheduled dose. Stored only when
 * a dose is acted on, so a dose with no event is pending by absence.
 */
export type DoseEvent = OccurrenceKey & {
  note?: string;
  /** When it was logged, which is deliberately not the scheduled time. */
  recordedAt: Instant;
  recordedBy: RecordedBy;
} & ({ outcome: "given" } | { outcome: "not-given"; reason: NotGivenReason });

/**
 * One dose on one day, derived from the schedules in force and matched against
 * the recorded events. Computed on demand, never stored.
 */
export type Occurrence = OccurrenceKey & {
  /** Null when an event exists for a slot no schedule in force accounts for. */
  scheduleId: string | null;
  event: DoseEvent | null;
};

/** Pending, due soon and overdue are functions of the schedule and the clock. */
export type DoseStatus = "pending" | "due-soon" | "overdue" | Outcome;
