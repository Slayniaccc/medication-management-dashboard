import type { TimeOfDay } from "../model/time";
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

// The stored reason is the code. The sentence is built here because it
// contains the patient's name, which can change after the event is recorded.
export function reasonLabel(reason: NotGivenReason, patientName: string) {
  const labels: Record<NotGivenReason, string> = {
    refused: `${patientName} refused to take the medicine`,
    asleep: `${patientName} was asleep`,
    unwell: `${patientName} felt unwell`,
    unavailable: "The medicine was unavailable",
    "withheld-on-clinical-advice": "The dose was withheld following clinical advice",
    "carer-unable": "I was unable to administer the medicine",
    other: "Other reason",
  };
  return labels[reason];
}
