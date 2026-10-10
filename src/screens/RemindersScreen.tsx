import type { Dispatch, SetStateAction } from "react";
import { Icon } from "../components/Icon";
import { ToggleRow } from "../components/ToggleRow";
import type { Medication, Schedule } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { formatTime } from "./format";

export function RemindersScreen({
  activeSchedules,
  details,
  medicationById,
  setReminderOn,
  setSoundAlerts,
  setToast,
  shell,
}: {
  activeSchedules: Schedule[];
  details: Details;
  medicationById: Map<string, Medication>;
  setReminderOn: Dispatch<SetStateAction<boolean>>;
  setSoundAlerts: Dispatch<SetStateAction<boolean>>;
  setToast: (message: string) => void;
  shell: CarerPageShell;
}) {
  const { patientName, reminderOn, soundAlerts } = details;

  return (
    <CarerPage
      {...shell}
      description={`Review and manage every medication reminder for ${patientName}.`}
      eyebrow="Daily schedule"
      title="Reminders"
    >
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="reminder-list-heading" className="space-y-4">
          <h2 id="reminder-list-heading" className="sr-only">
            Scheduled reminders
          </h2>
          {activeSchedules.map((schedule) => {
            const medication = medicationById.get(schedule.medicationId);
            if (!medication) return null;
            return (
              <article
                className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center"
                key={schedule.id}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon name="bell" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold">{formatTime(schedule.timeOfDay)}</p>
                  <p className="mt-1 font-bold">{medication.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {medication.strength} · {medication.form}
                  </p>
                </div>
                <button
                  className="min-h-12 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => {
                    setToast(`${medication.name} reminder moved by 10 minutes.`);
                    window.setTimeout(() => setToast(""), 2800);
                  }}
                  type="button"
                >
                  Remind in 10 min
                </button>
              </article>
            );
          })}
        </section>
        <aside className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Reminder controls</h2>
          <div className="mt-4">
            <ToggleRow
              checked={reminderOn}
              description="Send medication reminders to the carer dashboard."
              label="Medication reminders"
              onChange={() => setReminderOn((value) => !value)}
            />
            <ToggleRow
              checked={soundAlerts}
              description="Play a sound with high-priority reminders."
              label="Sound alerts"
              onChange={() => setSoundAlerts((value) => !value)}
            />
          </div>
        </aside>
      </div>
    </CarerPage>
  );
}
