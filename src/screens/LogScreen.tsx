import { Icon } from "../components/Icon";
import { minutesAfterScheduled, occurrenceKey } from "../model/doses";
import { localDateOf } from "../model/time";
import type { DoseEvent, Medication } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { clockParts, dayLabel, formatTime, reasonLabel } from "./format";

// How long after its time a dose was logged, as a plain count. It is the gap
// between two recorded times and nothing more: the log does not say whether a
// gap matters.
function gapLabel(event: DoseEvent) {
  const minutes = minutesAfterScheduled(event);
  if (minutes < 60) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourWords = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${rest === 0 ? hourWords : `${hourWords} ${rest} min`} after its time`;
}

export function LogScreen({
  details,
  events,
  medicationById,
  now,
  shell,
}: {
  details: Details;
  events: DoseEvent[];
  medicationById: Map<string, Medication>;
  now: Date;
  shell: CarerPageShell;
}) {
  const { carerName, patientName } = details;

  // Newest first. The occurrence key sorts in scheduled order.
  const loggedDoses = [...events].sort((a, b) =>
    occurrenceKey(a) < occurrenceKey(b) ? 1 : -1,
  );

  return (
    <CarerPage
      {...shell}
      description="Every dose that has been logged, newest first, with when it was due, when it was logged and who logged it."
      eyebrow="What was logged"
      title="Medicine log"
    >
      {loggedDoses.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 text-base leading-7 text-ink-soft">
          No doses logged yet. Log a dose as given or not given on the dashboard and it is
          listed here.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {loggedDoses.map((event) => {
            const medication = medicationById.get(event.medicationId);
            const given = event.outcome === "given";
            const loggedAt = new Date(event.recordedAt);
            const loggedOn = localDateOf(loggedAt);
            const loggedTime = clockParts(loggedAt.getHours(), loggedAt.getMinutes());
            const gap = gapLabel(event);
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
                  <p className="text-base font-bold">
                    {medication ? `${medication.name} · ${medication.strength}` : "Medicine"}
                  </p>
                  <p className="mt-1 text-base text-ink-muted">
                    Due {dayLabel(event.date, now).toLowerCase()} at {formatTime(event.timeOfDay)}
                  </p>
                  <p className="mt-1 text-base text-ink-muted">
                    Logged{" "}
                    {loggedOn === event.date ? "" : `${dayLabel(loggedOn, now).toLowerCase()} `}
                    at {loggedTime.clock} {loggedTime.period}
                    {gap ? `, ${gap},` : ""} by{" "}
                    {event.recordedBy === "carer" ? carerName || "the carer" : patientName || "the patient"}
                  </p>
                  {event.outcome === "not-given" && (
                    <p className="mt-1 text-base font-bold text-ink-soft">
                      Reason: {reasonLabel(event.reason, patientName, carerName)}
                    </p>
                  )}
                  {event.note && <p className="mt-1 text-base text-ink-soft">Note: {event.note}</p>}
                </div>
                <span
                  className={`self-start rounded-full px-3 py-2 text-sm font-bold sm:self-center ${
                    given ? "bg-given-subtle text-given" : "bg-not-given-subtle text-not-given"
                  }`}
                >
                  {given ? "Given" : "Not given"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CarerPage>
  );
}
