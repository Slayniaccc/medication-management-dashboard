import { localDateOf, wallClockDate, type LocalDate, type TimeOfDay } from "../model/time";
import type { NotGivenReason } from "../model/types";

export function clockParts(hours: number, minutes: number) {
  return {
    clock: `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    period: hours < 12 ? "AM" : "PM",
  };
}

export function timeParts(timeOfDay: TimeOfDay) {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  return clockParts(hours, minutes);
}

export function formatTime(timeOfDay: TimeOfDay) {
  const { clock, period } = timeParts(timeOfDay);
  return `${clock} ${period}`;
}

/** "Thursday 8 October". The year is left out because the log is recent. */
export function formatDate(date: LocalDate) {
  return wallClockDate(date, "00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const daysBefore = (at: Date, days: number): LocalDate =>
  localDateOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() - days));

/**
 * A day as it reads part way through a sentence: "today", "yesterday", or
 * "on Thursday 8 October" for any other day.
 */
export function dayPhrase(date: LocalDate, now: Date) {
  if (date === localDateOf(now)) return "today";
  if (date === daysBefore(now, 1)) return "yesterday";
  return `on ${formatDate(date)}`;
}

export function greeting(now: Date) {
  const hour = now.getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

// The stored reason is the code. The sentence is built here because it
// contains names, which can change after the event is recorded. Every one is
// in the third person, so the log reads the same whoever is reading it.
export function reasonLabel(reason: NotGivenReason, patientName: string, carerName: string) {
  const patient = patientName || "The patient";
  const carer = carerName || "The carer";
  const labels: Record<NotGivenReason, string> = {
    refused: `${patient} did not want to take it`,
    asleep: `${patient} was asleep`,
    unwell: `${patient} felt unwell`,
    unavailable: "The medicine was not available",
    "withheld-on-clinical-advice": "A doctor, nurse or pharmacist said not to give it",
    "carer-unable": `${carer} was not able to give it`,
    other: "Another reason",
  };
  return labels[reason];
}

// The same seven reasons as the patient would say them, for when the patient
// is the one logging.
export function reasonLabelForPatient(reason: NotGivenReason, carerName: string) {
  const labels: Record<NotGivenReason, string> = {
    refused: "I did not want to take it",
    asleep: "I was asleep",
    unwell: "I felt unwell",
    unavailable: "The medicine was not available",
    "withheld-on-clinical-advice": "A doctor, nurse or pharmacist said not to take it",
    "carer-unable": `${carerName || "My carer"} was not able to give it to me`,
    other: "Another reason",
  };
  return labels[reason];
}
