import { occurrenceKey } from "../model/doses";
import type { Repository, Snapshot } from "./repository";

/**
 * Holds everything in memory and loses it with the page. Used when the browser
 * will not open a database, so the app still works for the visit and can say
 * plainly that nothing is being kept.
 */
export function createMemoryRepository(initial: Snapshot): Repository {
  let medications = new Map(initial.medications.map((item) => [item.id, item]));
  let schedules = new Map(initial.schedules.map((item) => [item.id, item]));
  let events = new Map(initial.events.map((item) => [occurrenceKey(item), item]));
  let details = initial.details;

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

    async replaceAll(snapshot) {
      medications = new Map(snapshot.medications.map((item) => [item.id, item]));
      schedules = new Map(snapshot.schedules.map((item) => [item.id, item]));
      events = new Map(snapshot.events.map((item) => [occurrenceKey(item), item]));
      details = snapshot.details;
    },
  };
}
