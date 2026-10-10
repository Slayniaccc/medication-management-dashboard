import { Icon } from "../components/Icon";
import { occurrenceKey } from "../model/doses";
import { localDateOf, wallClockDate, type LocalDate } from "../model/time";
import type { DoseEvent, Medication } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { clockParts, formatTime, reasonLabel } from "./format";

const daysBefore = (at: Date, days: number): LocalDate =>
  localDateOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() - days));

export function LogScreen({
  details,
  events,
  medicationById,
  now,
  setToast,
  shell,
}: {
  details: Details;
  events: DoseEvent[];
  medicationById: Map<string, Medication>;
  now: Date;
  setToast: (message: string) => void;
  shell: CarerPageShell;
}) {
  const { carerName, patientName } = details;
  const today = localDateOf(now);
  const dayLabel = (date: LocalDate) =>
    date === today
      ? "Today"
      : date === daysBefore(now, 1)
        ? "Yesterday"
        : wallClockDate(date, "00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });

  // Newest first. The occurrence key sorts in scheduled order.
  const loggedDoses = [...events].sort((a, b) =>
    occurrenceKey(a) < occurrenceKey(b) ? 1 : -1,
  );

  return (
    <CarerPage
      {...shell}
      description="Review given and not-given doses with dates, times, and recorded reasons."
      eyebrow="Care records"
      title="Medicine log"
    >
      <section
        aria-labelledby="full-log-heading"
        className="overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="full-log-heading" className="text-xl font-bold">
            Recent dose activity
          </h2>
          <button
            className="min-h-11 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
            onClick={() => {
              setToast("Medicine log prepared for export.");
              window.setTimeout(() => setToast(""), 2800);
            }}
            type="button"
          >
            Export log
          </button>
        </div>
        {loggedDoses.length === 0 && (
          <p className="p-5 text-ink-muted">
            No doses logged yet. Log a dose from the dashboard and it appears here.
          </p>
        )}
        <ul className="divide-y divide-line">
          {loggedDoses.map((event) => {
            const medication = medicationById.get(event.medicationId);
            const given = event.outcome === "given";
            const loggedAt = new Date(event.recordedAt);
            const loggedOn = localDateOf(loggedAt);
            const loggedTime = clockParts(loggedAt.getHours(), loggedAt.getMinutes());
            return (
              <li
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
                key={occurrenceKey(event)}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    given ? "bg-given-subtle text-given" : "bg-not-given-subtle text-not-given"
                  }`}
                >
                  <Icon name={given ? "check" : "close"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {medication ? `${medication.name} · ${medication.strength}` : "Medicine"}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Scheduled {dayLabel(event.date)}, {formatTime(event.timeOfDay)} · Logged{" "}
                    {loggedOn === event.date ? "" : `${dayLabel(loggedOn)}, `}
                    {loggedTime.clock} {loggedTime.period} by{" "}
                    {event.recordedBy === "carer" ? carerName : patientName}
                  </p>
                  {event.outcome === "not-given" && (
                    <p className="mt-1 text-sm font-bold text-ink-soft">
                      Reason: {reasonLabel(event.reason, patientName)}
                    </p>
                  )}
                  {event.note && (
                    <p className="mt-1 text-sm text-ink-soft">Note: {event.note}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-2 text-sm font-bold ${
                    given ? "bg-given-subtle text-given" : "bg-not-given-subtle text-not-given"
                  }`}
                >
                  {given ? "Given" : "Not given"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </CarerPage>
  );
}
