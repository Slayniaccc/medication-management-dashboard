import { useState } from "react";
import { doseStatus, occurrencesOn, recordDose } from "../model/doses";
import { closeSchedule, isInForce } from "../model/schedules";
import { localDateOf, toInstant, type TimeOfDay } from "../model/time";
import type {
  DoseEvent,
  Medication,
  NotGivenReason,
  OccurrenceKey,
  RecordedBy,
  Schedule,
} from "../model/types";
import { formatTime } from "../screens/format";
import type { Repository, Snapshot } from "../storage/repository";

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
    flashToast("Dose logged as given.");
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
    flashToast("Not-given dose and reason saved.");
  };

  const addPrescription = ({
    form,
    imageUrl,
    strength,
    times,
  }: {
    form: string;
    imageUrl: string | undefined;
    strength: string;
    times: TimeOfDay[];
  }) => {
    const medicationId = crypto.randomUUID();
    const added: Schedule[] = times.map((timeOfDay) => ({
      id: crypto.randomUUID(),
      medicationId,
      timeOfDay,
      startDate: today,
      endDate: null,
    }));
    const medication: Medication = {
      id: medicationId,
      name: `Medicine ${medications.length + 1}`,
      purpose: "New prescription",
      strength,
      form,
      instructions: "",
      carerNotes: "",
      colour: "indigo",
      imageUrl,
    };
    setMedications((items) => [...items, medication]);
    setSchedules((items) => [...items, ...added]);
    save(repository.addPrescription(medication, added));
    flashToast("New prescription added.");
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
  };

  return {
    activeMedications,
    activeSchedules,
    addPrescription,
    events,
    markGiven,
    markNotGiven,
    medicationById,
    medications,
    nextDose,
    nextMedication,
    reminderTimesFor,
    removePrescription,
    todaysDoses,
    todaysRows,
  };
}
