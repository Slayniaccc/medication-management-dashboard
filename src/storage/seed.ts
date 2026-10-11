import { localDateOf, toInstant, wallClockDate } from "../model/time";
import type { LocalDate, TimeOfDay } from "../model/time";
import type { DoseEvent, Medication, Schedule } from "../model/types";
import type { Details, Snapshot } from "./repository";

const medications: Medication[] = [
  {
    id: "medicine-1",
    name: "Medicine 1",
    purpose: "Blood pressure",
    strength: "10 mg",
    form: "1 tablet",
    instructions: "Take with a full glass of water",
    carerNotes: "",
    colour: "coral",
  },
  {
    id: "medicine-2",
    name: "Medicine 2",
    purpose: "Blood sugar",
    strength: "500 mg",
    form: "1 tablet",
    instructions: "Take with breakfast",
    carerNotes: "",
    colour: "teal",
  },
  {
    id: "medicine-3",
    name: "Medicine 3",
    purpose: "Daily supplement",
    strength: "1,000 IU",
    form: "1 capsule",
    instructions: "Take with food",
    carerNotes: "",
    colour: "ochre",
  },
];

const schedules: Schedule[] = [
  {
    id: "schedule-1",
    medicationId: "medicine-1",
    timeOfDay: "08:00",
    startDate: "2026-01-01",
    endDate: null,
  },
  {
    id: "schedule-2",
    medicationId: "medicine-2",
    timeOfDay: "08:30",
    startDate: "2026-01-01",
    endDate: null,
  },
  {
    id: "schedule-3",
    medicationId: "medicine-3",
    timeOfDay: "13:00",
    startDate: "2026-01-01",
    endDate: null,
  },
];

const daysBefore = (at: Date, days: number): LocalDate =>
  localDateOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() - days));

// The two days before the app was first opened, so the medicine log has
// history to show.
function seedEvents(now: Date): DoseEvent[] {
  const yesterday = daysBefore(now, 1);
  const dayBefore = daysBefore(now, 2);
  const loggedAt = (date: LocalDate, time: TimeOfDay) => toInstant(wallClockDate(date, time));
  return [
    {
      medicationId: "medicine-1",
      date: dayBefore,
      timeOfDay: "08:00",
      outcome: "given",
      recordedAt: loggedAt(dayBefore, "08:02"),
      recordedBy: "carer",
    },
    {
      medicationId: "medicine-3",
      date: dayBefore,
      timeOfDay: "13:00",
      outcome: "not-given",
      reason: "refused",
      recordedAt: loggedAt(dayBefore, "13:00"),
      recordedBy: "carer",
    },
    {
      medicationId: "medicine-1",
      date: yesterday,
      timeOfDay: "08:00",
      outcome: "given",
      recordedAt: loggedAt(yesterday, "08:04"),
      recordedBy: "carer",
    },
    {
      medicationId: "medicine-2",
      date: yesterday,
      timeOfDay: "08:30",
      outcome: "given",
      recordedAt: loggedAt(yesterday, "08:32"),
      recordedBy: "carer",
    },
  ];
}

function seedDetails(now: Date): Details {
  return {
    patientName: "Asha",
    patientAge: "63",
    disabilities: "Reduced vision and difficulty distinguishing some colours",
    medicalNeeds: "Blood pressure monitoring and blood sugar support",
    carerName: "Meera",
    carerPhone: "07123 456 789",
    carerEmail: "meera@example.com",
    carerRelationship: "Family carer",
    carerAvailability: "Primary daytime contact",
    consentGiven: false,
    consentMethod: "Confirmed directly by patient",
    consentDate: now.toISOString().slice(0, 10),
    allowMedicineChanges: false,
    readAloud: false,
    patientTheme: "high-contrast",
    textSize: "large",
    colourSafe: true,
    reducedMotion: true,
    simplifiedLayout: true,
    reminderOn: true,
    emailUpdates: true,
    soundAlerts: true,
  };
}

/** What a new database starts with. Written once, when the database is created. */
export function seedSnapshot(now: Date): Snapshot {
  return {
    medications,
    schedules,
    events: seedEvents(now),
    details: seedDetails(now),
  };
}
