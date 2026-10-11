import type { DoseEvent, Medication, Schedule } from "../model/types";
import type { Details, Repository } from "./repository";

const DATABASE = "accesscare";
const VERSION = 1;

const MEDICATIONS = "medications";
const SCHEDULES = "schedules";
// Keyed on the occurrence itself, so a second write for the same dose lands on
// the same row here as well as in the model.
const DOSE_EVENTS = "doseEvents";
const DOSE_EVENT_KEY = ["date", "timeOfDay", "medicationId"];
// One record under one key.
const DETAILS = "details";
const DETAILS_KEY = "details";

function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// A write is only safe once its transaction completes, not when the request
// inside it succeeds.
function completed(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    // A new database starts empty. The example is only ever written because
    // the carer asked for it, through replaceAll.
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore(MEDICATIONS, { keyPath: "id" });
      database.createObjectStore(SCHEDULES, { keyPath: "id" });
      database.createObjectStore(DOSE_EVENTS, { keyPath: DOSE_EVENT_KEY });
      database.createObjectStore(DETAILS);
    };
    request.onsuccess = () => {
      const database = request.result;
      // Let a newer version of the app upgrade rather than blocking it.
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Opens the database on this device, creating it empty the first time.
 * `defaults` is what the details are until the carer enters their own.
 * Rejects when the browser has no IndexedDB or refuses to open it.
 */
export async function openIndexedDbRepository(defaults: Details): Promise<Repository> {
  const database = await openDatabase();

  const write = (stores: string[], put: (transaction: IDBTransaction) => void) => {
    const transaction = database.transaction(stores, "readwrite");
    put(transaction);
    return completed(transaction);
  };

  return {
    durable: true,

    async load() {
      const transaction = database.transaction(
        [MEDICATIONS, SCHEDULES, DOSE_EVENTS, DETAILS],
        "readonly",
      );
      const [medications, schedules, events, details] = await Promise.all([
        result<Medication[]>(transaction.objectStore(MEDICATIONS).getAll()),
        result<Schedule[]>(transaction.objectStore(SCHEDULES).getAll()),
        result<DoseEvent[]>(transaction.objectStore(DOSE_EVENTS).getAll()),
        result<Partial<Details> | undefined>(transaction.objectStore(DETAILS).get(DETAILS_KEY)),
      ]);
      // A field added after the record was stored takes its default.
      return { medications, schedules, events, details: { ...defaults, ...details } };
    },

    addPrescription(medication, schedules) {
      return write([MEDICATIONS, SCHEDULES], (transaction) => {
        transaction.objectStore(MEDICATIONS).put(medication);
        for (const schedule of schedules) transaction.objectStore(SCHEDULES).put(schedule);
      });
    },

    saveSchedules(schedules) {
      return write([SCHEDULES], (transaction) => {
        for (const schedule of schedules) transaction.objectStore(SCHEDULES).put(schedule);
      });
    },

    recordDose(event) {
      return write([DOSE_EVENTS], (transaction) => {
        transaction.objectStore(DOSE_EVENTS).put(event);
      });
    },

    saveDetails(details) {
      return write([DETAILS], (transaction) => {
        transaction.objectStore(DETAILS).put(details, DETAILS_KEY);
      });
    },

    // One transaction, so a failure part way leaves what was there before.
    replaceAll(snapshot) {
      return write([MEDICATIONS, SCHEDULES, DOSE_EVENTS, DETAILS], (transaction) => {
        const medications = transaction.objectStore(MEDICATIONS);
        const schedules = transaction.objectStore(SCHEDULES);
        const events = transaction.objectStore(DOSE_EVENTS);
        const details = transaction.objectStore(DETAILS);
        for (const store of [medications, schedules, events, details]) store.clear();
        for (const medication of snapshot.medications) medications.put(medication);
        for (const schedule of snapshot.schedules) schedules.put(schedule);
        for (const event of snapshot.events) events.put(event);
        details.put(snapshot.details, DETAILS_KEY);
      });
    },
  };
}
