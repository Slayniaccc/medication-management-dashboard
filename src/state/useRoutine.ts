import { useState } from "react";
import { doseStatus, occurrencesOn, recordDose } from "../model/doses";
import { closeSchedule, isInForce } from "../model/schedules";
import { localDateOf, toInstant, type LocalDate, type TimeOfDay } from "../model/time";
import type {
  DoseEvent,
  Medication,
  MedicationColour,
  NotGivenReason,
  OccurrenceKey,
  RecordedBy,
  Schedule,
} from "../model/types";
import { formatTime } from "../screens/format";
import type { Repository, Snapshot } from "../storage/repository";

const colours: MedicationColour[] = ["coral", "teal", "ochre", "indigo"];

export type NewPrescription = {
  form: string;
  imageUrl: string | undefined;
  name: string;
  note: string;
  purpose: string;
  strength: string;
  times: TimeOfDay[];
};

// The medicines, when they are due and what has been logged against them,
// with everything the screens read worked out from those three and the clock.
export function useRoutine({
  flashToast,
  initial,
  now,
  onSaveFailed,
  repository,
}: {
  flashToast: (message: string) => void;
  initial: Snapshot;
  now: Date;
  onSaveFailed: () => void;
  repository: Repository;
}) {
  const [medications, setMedications] = useState(initial.medications);
  const [schedules, setSchedules] = useState(initial.schedules);
  const [events, setEvents] = useState(initial.events);

  // A write that fails must not pass silently, because the screen already
  // shows the change as made.
  const save = (write: Promise<void>) => {
    write.catch(onSaveFailed);
  };

  const today = localDateOf(now);
  const medicationById = new Map(medications.map((item) => [item.id, item]));
  const todaysDoses = occurrencesOn(today, schedules, events);
  const todaysRows = todaysDoses.flatMap((dose) => {
    const medication = medicationById.get(dose.medicationId);
    return medication ? [{ dose, medication, status: doseStatus(dose, now) }] : [];
  });
  const nextDose = todaysDoses.find((dose) => dose.event === null) ?? null;
  const nextMedication = nextDose ? (medicationById.get(nextDose.medicationId) ?? null) : null;
  const activeSchedules = schedules
    .filter((schedule) => isInForce(schedule, today))
    .sort((a, b) => (a.timeOfDay < b.timeOfDay ? -1 : a.timeOfDay > b.timeOfDay ? 1 : 0));
  // A removed prescription keeps its definition so the log can still name it.
  const activeMedications = medications.filter((item) =>
    activeSchedules.some((schedule) => schedule.medicationId === item.id),
  );
  const reminderTimesFor = (medicationId: string) =>
    activeSchedules
      .filter((schedule) => schedule.medicationId === medicationId)
      .map((schedule) => formatTime(schedule.timeOfDay));

  // The schedules a removed medicine was last on: the ones that ended latest.
  const lastSchedulesOf = (medicationId: string) => {
    const ended = schedules.filter(
      (schedule) => schedule.medicationId === medicationId && schedule.endDate !== null,
    );
    const removedOn = ended.reduce<LocalDate | null>(
      (latest, schedule) =>
        latest === null || schedule.endDate! > latest ? schedule.endDate : latest,
      null,
    );
    return { removedOn, last: ended.filter((schedule) => schedule.endDate === removedOn) };
  };
  // Removing is undone from this list, so it does not depend on catching a
  // message before it goes.
  const removedPrescriptions = medications.flatMap((medication) => {
    if (activeMedications.includes(medication)) return [];
    const { removedOn, last } = lastSchedulesOf(medication.id);
    return removedOn === null
      ? []
      : [{ medication, removedOn, times: last.map((item) => formatTime(item.timeOfDay)).sort() }];
  });

  const markGiven = ({ medicationId, date, timeOfDay }: OccurrenceKey, recordedBy: RecordedBy) => {
    const event: DoseEvent = {
      medicationId,
      date,
      timeOfDay,
      outcome: "given",
      recordedAt: toInstant(new Date()),
      recordedBy,
    };
    setEvents((items) => recordDose(items, event));
    save(repository.recordDose(event));
    // The patient view says what was recorded in its own words, and keeps it
    // on screen, so the carer's message is not shown there as well.
    if (recordedBy === "carer") flashToast("Dose logged as given.");
  };

  const markNotGiven = (
    { medicationId, date, timeOfDay }: OccurrenceKey,
    reason: NotGivenReason,
    recordedBy: RecordedBy,
  ) => {
    const event: DoseEvent = {
      medicationId,
      date,
      timeOfDay,
      outcome: "not-given",
      reason,
      recordedAt: toInstant(new Date()),
      recordedBy,
    };
    setEvents((items) => recordDose(items, event));
    save(repository.recordDose(event));
    if (recordedBy === "carer") flashToast("Dose logged as not given, with the reason.");
  };

  const addPrescription = ({
    form,
    imageUrl,
    name,
    note,
    purpose,
    strength,
    times,
  }: NewPrescription) => {
    const medicationId = crypto.randomUUID();
    const added: Schedule[] = times.map((timeOfDay) => ({
      id: crypto.randomUUID(),
      medicationId,
      timeOfDay,
      startDate: today,
      endDate: null,
    }));
    // Everything here is what the carer typed. Nothing is filled in for them.
    const medication: Medication = {
      id: medicationId,
      name,
      purpose,
      strength,
      form,
      instructions: note,
      carerNotes: "",
      colour: colours[medications.length % colours.length],
      imageUrl,
    };
    setMedications((items) => [...items, medication]);
    setSchedules((items) => [...items, ...added]);
    save(repository.addPrescription(medication, added));
    flashToast("Prescription added.");
  };

  // Ends the medicine's schedules from today rather than deleting anything, so
  // doses already logged against it keep resolving.
  const removePrescription = (medicationId: string) => {
    const closed = schedules
      .filter((schedule) => schedule.medicationId === medicationId && schedule.endDate === null)
      .reduce(
        (result, schedule) =>
          closeSchedule(
            result,
            schedule.id,
            schedule.startDate > today ? schedule.startDate : today,
          ),
        schedules,
      );
    setSchedules(closed);
    // closeSchedule leaves untouched schedules as the same objects.
    save(repository.saveSchedules(closed.filter((schedule) => !schedules.includes(schedule))));
    flashToast("Prescription removed.");
  };

  // Puts a removed medicine back on the times it was last on. The ended
  // schedules stay ended and new ones start today, so nothing is reopened.
  const addBackPrescription = (medicationId: string) => {
    const added: Schedule[] = lastSchedulesOf(medicationId).last.map((schedule) => ({
      id: crypto.randomUUID(),
      medicationId,
      timeOfDay: schedule.timeOfDay,
      startDate: today,
      endDate: null,
    }));
    if (added.length === 0) return;
    setSchedules((items) => [...items, ...added]);
    save(repository.saveSchedules(added));
    flashToast("Prescription added back.");
  };

  return {
    activeMedications,
    activeSchedules,
    addBackPrescription,
    addPrescription,
    events,
    markGiven,
    markNotGiven,
    medicationById,
    nextDose,
    nextMedication,
    reminderTimesFor,
    removePrescription,
    removedPrescriptions,
    schedules,
    todaysDoses,
    todaysRows,
  };
}
