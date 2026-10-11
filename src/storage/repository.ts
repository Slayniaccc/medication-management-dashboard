import type { DoseEvent, Medication, Schedule } from "../model/types";

export type PatientTheme = "light" | "high-contrast" | "dark";
export type TextSize = "standard" | "large" | "extra-large";

/**
 * Everything the carer has entered that is not a medication, a schedule or a
 * dose: who the patient and carer are, the consent record, and how the app is
 * set up for them. Kept as one record because it is read and shown together.
 */
export type Details = {
  patientName: string;
  patientAge: string;
  disabilities: string;
  medicalNeeds: string;
  carerName: string;
  carerPhone: string;
  carerEmail: string;
  carerRelationship: string;
  carerAvailability: string;
  consentGiven: boolean;
  consentMethod: string;
  consentDate: string;
  allowMedicineChanges: boolean;
  readAloud: boolean;
  patientTheme: PatientTheme;
  textSize: TextSize;
  colourSafe: boolean;
  reducedMotion: boolean;
  simplifiedLayout: boolean;
  /** True while this device holds the made-up example, so the app can say so and offer to clear it. */
  exampleData: boolean;
};

/** Everything that is kept, as read back when the app starts. */
export type Snapshot = {
  medications: Medication[];
  schedules: Schedule[];
  events: DoseEvent[];
  details: Details;
};

/**
 * The only way anything is kept. The UI holds a repository and never touches
 * storage itself, so keeping the data somewhere else is one more
 * implementation of this interface and nothing above it changes.
 *
 * Each write is one change the carer made, not the whole state, and each
 * resolves once the change is safely stored.
 */
export interface Repository {
  /** False when nothing written here outlives the page. */
  readonly durable: boolean;
  load(): Promise<Snapshot>;
  /** Stores a medication with its schedules together, so neither exists without the other. */
  addPrescription(medication: Medication, schedules: readonly Schedule[]): Promise<void>;
  /** Stores new schedules, or schedules that have been closed. */
  saveSchedules(schedules: readonly Schedule[]): Promise<void>;
  /** Stores an event at its occurrence key, replacing any event already there. */
  recordDose(event: DoseEvent): Promise<void>;
  saveDetails(details: Details): Promise<void>;
  /**
   * Replaces everything that is kept with this snapshot, all or nothing. Used
   * to load the example and to clear it again, never on a carer's own data.
   */
  replaceAll(snapshot: Snapshot): Promise<void>;
}
