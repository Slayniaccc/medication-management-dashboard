import { occurrenceKey } from "../model/doses";
import type { Repository, Snapshot } from "./repository";

/**
 * Holds everything in memory and loses it with the page. Used when the browser
 * will not open a database, so the app still works for the visit and can say
 * plainly that nothing is being kept.
 */
export function createMemoryRepository(seed: Snapshot): Repository {
  const medications = new Map(seed.medications.map((item) => [item.id, item]));
  const schedules = new Map(seed.schedules.map((item) => [item.id, item]));
  const events = new Map(seed.events.map((item) => [occurrenceKey(item), item]));
  let details = seed.details;

  return {
    durable: false,

    async load() {
      return {
        medications: [...medications.values()],
        schedules: [...schedules.values()],
        events: [...events.values()],
        details,
      };
    },

    async addPrescription(medication, added) {
      medications.set(medication.id, medication);
      for (const schedule of added) schedules.set(schedule.id, schedule);
    },

    async saveSchedules(changed) {
      for (const schedule of changed) schedules.set(schedule.id, schedule);
    },

    async recordDose(event) {
      events.set(occurrenceKey(event), event);
    },

    async saveDetails(next) {
      details = next;
    },
  };
}
