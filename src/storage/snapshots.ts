import { localDateOf, toInstant, wallClockDate } from "../model/time";
import type { LocalDate, TimeOfDay } from "../model/time";
import type {
  DoseEvent,
  Medication,
  NotGivenReason,
  RecordedBy,
  Schedule,
} from "../model/types";
import type { Details, Snapshot } from "./repository";

/** The details before anyone has entered anything. Every setting starts at its plainest. */
export const emptyDetails: Details = {
  patientName: "",
  patientAge: "",
  disabilities: "",
  medicalNeeds: "",
  carerName: "",
  carerPhone: "",
  carerEmail: "",
  carerRelationship: "",
  carerAvailability: "",
  consentGiven: false,
  consentMethod: "Confirmed directly by patient",
  consentDate: "",
  allowMedicineChanges: false,
  readAloud: false,
  patientTheme: "light",
  textSize: "standard",
  colourSafe: false,
  reducedMotion: false,
  simplifiedLayout: false,
  exampleData: false,
};

/** What a new database holds: nothing. */
export function emptySnapshot(): Snapshot {
  return { medications: [], schedules: [], events: [], details: emptyDetails };
}

/**
 * True until the carer has entered anything at all. Worked out from what is
 * stored rather than kept as a flag, so it cannot disagree with the data.
 */
export function isFirstRun({ details, events, medications }: Snapshot): boolean {
  return (
    medications.length === 0 &&
    events.length === 0 &&
    details.carerName === "" &&
    details.patientName === ""
  );
}

// Everything below is the example a carer can choose to look around in. The
// people and the medicines are made up, and the names say nothing about what
// the medicine is.

const medications: Medication[] = [
  {
    id: "example-medicine-1",
    name: "Medicine 1",
    purpose: "Blood pressure",
    strength: "10 mg",
    form: "1 tablet",
    instructions: "With a full glass of water",
    carerNotes: "",
    colour: "coral",
  },
  {
    id: "example-medicine-2",
    name: "Medicine 2",
    purpose: "Blood sugar",
    strength: "500 mg",
    form: "1 tablet",
    instructions: "With breakfast",
    carerNotes: "",
    colour: "teal",
  },
  {
    id: "example-medicine-3",
    name: "Medicine 3",
    purpose: "Daily supplement",
    strength: "1,000 IU",
    form: "1 capsule",
    instructions: "",
    carerNotes: "",
    colour: "ochre",
  },
];

const daysBefore = (at: Date, days: number): LocalDate =>
  localDateOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() - days));

/**
 * A week of Asha and Meera's routine, ending yesterday, with today still to
 * log. It is built to show what the model keeps:
 *
 * - most doses given and logged within a few minutes of their time
 * - one dose logged four hours late, which reads differently in the log
 * - two doses not given, each with its reason
 * - two doses logged by Asha from the patient view, one of them the dose she
 *   did not want, so the log shows both people and logging is on in her view
 * - Medicine 2 moved from 8:30 to 9:00 three days ago. The old schedule was
 *   closed and a new one opened, so the earlier doses still sit at 8:30
 */
export function exampleSnapshot(now: Date): Snapshot {
  const firstDay = daysBefore(now, 6);
  const changeDay = daysBefore(now, 3);

  const schedule = (
    id: string,
    medicationId: string,
    timeOfDay: TimeOfDay,
    startDate: LocalDate,
    endDate: LocalDate | null,
  ): Schedule => ({ id, medicationId, timeOfDay, startDate, endDate });

  const schedules = [
    schedule("example-schedule-1", "example-medicine-1", "08:00", firstDay, null),
    schedule("example-schedule-2", "example-medicine-1", "20:00", firstDay, null),
    schedule("example-schedule-3", "example-medicine-2", "08:30", firstDay, changeDay),
    schedule("example-schedule-4", "example-medicine-2", "09:00", changeDay, null),
    schedule("example-schedule-5", "example-medicine-3", "13:00", firstDay, null),
  ];

  const events: DoseEvent[] = [];
  const log = (
    medicationId: string,
    daysAgo: number,
    timeOfDay: TimeOfDay,
    loggedAt: TimeOfDay,
    reason?: NotGivenReason,
    recordedBy: RecordedBy = "carer",
  ) => {
    const date = daysBefore(now, daysAgo);
    const record = {
      medicationId,
      date,
      timeOfDay,
      recordedAt: toInstant(wallClockDate(date, loggedAt)),
      recordedBy,
    };
    events.push(
      reason ? { ...record, outcome: "not-given", reason } : { ...record, outcome: "given" },
    );
  };

  for (let daysAgo = 6; daysAgo >= 1; daysAgo -= 1) {
    log("example-medicine-1", daysAgo, "08:00", `08:0${daysAgo}` as TimeOfDay);

    if (daysAgo > 3) log("example-medicine-2", daysAgo, "08:30", "08:34");
    else log("example-medicine-2", daysAgo, "09:00", "09:02");

    if (daysAgo === 4) log("example-medicine-3", daysAgo, "13:00", "17:00");
    else if (daysAgo === 2) {
      log("example-medicine-3", daysAgo, "13:00", "13:10", "refused", "patient");
    } else if (daysAgo === 1) {
      log("example-medicine-3", daysAgo, "13:00", "13:05", undefined, "patient");
    } else log("example-medicine-3", daysAgo, "13:00", "13:05");

    if (daysAgo === 5) log("example-medicine-1", daysAgo, "20:00", "20:40", "asleep");
    else log("example-medicine-1", daysAgo, "20:00", "20:07");
  }

  return {
    medications,
    schedules,
    events,
    details: {
      ...emptyDetails,
      patientName: "Asha",
      patientAge: "63",
      disabilities: "Reduced vision, and some colours are hard to tell apart",
      medicalNeeds: "",
      carerName: "Meera",
      carerPhone: "07700 900123",
      carerEmail: "meera@example.com",
      carerRelationship: "Daughter",
      carerAvailability: "Most days",
      consentGiven: true,
      consentDate: firstDay,
      allowMedicineChanges: true,
      patientTheme: "high-contrast",
      textSize: "large",
      colourSafe: true,
      simplifiedLayout: true,
      exampleData: true,
    },
  };
}
