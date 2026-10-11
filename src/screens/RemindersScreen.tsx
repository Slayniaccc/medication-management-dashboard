import { Icon } from "../components/Icon";
import type { Medication, Schedule } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { dayLabel, formatTime } from "./format";

export function RemindersScreen({
  activeSchedules,
  details,
  medicationById,
  now,
  schedules,
  shell,
}: {
  activeSchedules: Schedule[];
  details: Details;
  medicationById: Map<string, Medication>;
  now: Date;
  // Every schedule, including ended ones, so a change of time can be shown.
  schedules: Schedule[];
  shell: CarerPageShell;
}) {
  const patient = details.patientName || "the person you support";

  // A time is never edited: the old schedule is ended and a new one starts on
  // the same date. So the schedule this one replaced is the one for the same
  // medicine that ended the day this one began.
  const replacedBy = (schedule: Schedule) =>
    schedules.find(
      (other) =>
        other.medicationId === schedule.medicationId &&
        other.endDate === schedule.startDate &&
        other.timeOfDay !== schedule.timeOfDay &&
        other.startDate < schedule.startDate,
    );

  return (
    <CarerPage
      {...shell}
      description={`The times of day each of ${patient}’s medicines is due. They are shown here and on the dashboard. AccessCare does not sound an alarm or send a notification.`}
      eyebrow="Daily schedule"
      title="Reminders"
    >
      {activeSchedules.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 text-base leading-7 text-ink-soft">
          No reminder times yet. They are set when you add a prescription, from the
          Prescriptions page.
        </p>
      ) : (
        <ul className="space-y-4">
          {activeSchedules.map((schedule) => {
            const medication = medicationById.get(schedule.medicationId);
            if (!medication) return null;
            const previous = replacedBy(schedule);
            return (
              <li
                className="flex items-start gap-5 rounded-2xl border border-line bg-surface p-5"
                key={schedule.id}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon name="clock" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">
                    {formatTime(schedule.timeOfDay)} · {medication.name}
                  </h2>
                  <p className="mt-1 text-base text-ink-muted">
                    {medication.strength} · {medication.form} · Every day
                  </p>
                  {previous && (
                    <p className="mt-2 text-base text-ink-soft">
                      Changed from {formatTime(previous.timeOfDay)}{" "}
                      {dayLabel(schedule.startDate, now).toLowerCase()}. Doses logged before the
                      change stay in the medicine log at {formatTime(previous.timeOfDay)}.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CarerPage>
  );
}
