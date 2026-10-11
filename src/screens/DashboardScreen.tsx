import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { MedicationImage } from "../components/MedicationImage";
import { doseStatus, occurrenceKey } from "../model/doses";
import { localDateOf } from "../model/time";
import type {
  DoseStatus,
  Medication,
  Occurrence,
  OccurrenceKey,
  RecordedBy,
} from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { formatDate, formatTime, greeting, timeParts } from "./format";

// A logged dose shows its outcome instead, and a pending one needs no label.
const unloggedStatusLabel: Partial<Record<DoseStatus, string>> = {
  "due-soon": "Due soon",
  overdue: "Overdue",
};

export function DashboardScreen({
  children,
  details,
  markGiven,
  nextDose,
  nextMedication,
  now,
  setReasonFor,
  setShowAddPrescription,
  shell,
  todaysRows,
}: {
  // The dialogs this screen can open.
  children: ReactNode;
  details: Details;
  markGiven: (dose: OccurrenceKey, recordedBy: RecordedBy) => void;
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  now: Date;
  setReasonFor: (value: { dose: OccurrenceKey; recordedBy: RecordedBy } | null) => void;
  setShowAddPrescription: (show: boolean) => void;
  shell: CarerPageShell;
  todaysRows: Array<{ dose: Occurrence; medication: Medication; status: DoseStatus }>;
}) {
  const { carerName, patientName } = details;
  const patient = patientName || "the person you support";
  const logged = todaysRows.filter(({ dose }) => dose.event !== null).length;
  const toLog = todaysRows.length - logged;

  // Logging a dose replaces the buttons that were pressed with its outcome, so
  // focus would be dropped. It goes to the outcome instead, which also reads
  // it out. The dialog has closed by the time this runs.
  const loggedKeys = todaysRows
    .filter(({ dose }) => dose.event !== null)
    .map(({ dose }) => occurrenceKey(dose))
    .join("|");
  const previousKeys = useRef(loggedKeys);
  useEffect(() => {
    if (previousKeys.current === loggedKeys) return;
    const before = new Set(previousKeys.current.split("|"));
    previousKeys.current = loggedKeys;
    const added = loggedKeys.split("|").find((key) => key && !before.has(key));
    if (added) document.getElementById(`dose-outcome-${added}`)?.focus();
  }, [loggedKeys]);

  return (
    <CarerPage
      {...shell}
      action={
        todaysRows.length > 0 && (
          <button
            className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-accent px-5 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={() => setShowAddPrescription(true)}
            type="button"
          >
            <Icon name="plus" />
            Add prescription
          </button>
        )
      }
      description={
        todaysRows.length === 0
          ? `No doses are scheduled for ${patient} today.`
          : toLog === 0
            ? `All ${todaysRows.length} of ${patient}’s doses today are logged.`
            : `${patient[0].toUpperCase()}${patient.slice(1)} has ${todaysRows.length} ${
                todaysRows.length === 1 ? "dose" : "doses"
              } today: ${logged} logged, ${toLog} still to log.`
      }
      eyebrow={formatDate(localDateOf(now))}
      title={`${greeting(now)}${carerName ? `, ${carerName.split(" ")[0]}` : ""}`}
    >
      {todaysRows.length === 0 ? (
        <section
          aria-labelledby="empty-today-heading"
          className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 md:p-8"
        >
          <h2 id="empty-today-heading" className="text-2xl font-bold">
            Add a prescription to start logging
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-ink-soft">
            Enter a medicine and the times of day it is due. Each dose then appears here every
            day, ready to log as given or not given.
          </p>
          <button
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => setShowAddPrescription(true)}
            type="button"
          >
            <Icon name="plus" />
            Add prescription
          </button>
        </section>
      ) : (
        <>
          <section
            aria-labelledby="next-dose-heading"
            className="flex items-start gap-4 rounded-2xl bg-accent-soft p-6 md:p-7"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-accent">
              <Icon name="clock" className="h-6 w-6" />
            </div>
            {nextDose && nextMedication ? (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Next dose to log
                  {unloggedStatusLabel[doseStatus(nextDose, now)]
                    ? ` · ${unloggedStatusLabel[doseStatus(nextDose, now)]}`
                    : ""}
                </p>
                <h2 id="next-dose-heading" className="mt-1 text-xl font-bold">
                  {nextMedication.name}, {formatTime(nextDose.timeOfDay)}
                </h2>
                <p className="mt-1 text-base font-medium text-ink-soft">
                  {nextMedication.strength} · {nextMedication.form}
                </p>
              </div>
            ) : (
              <h2 id="next-dose-heading" className="mt-2 text-xl font-bold">
                Every dose for today is logged
              </h2>
            )}
          </section>

          <section aria-labelledby="schedule-heading" className="mt-8">
            <h2 id="schedule-heading" className="text-2xl font-bold">
              Today’s doses
            </h2>
            <p className="mt-1 text-base text-ink-muted">
              Log each dose as given or not given.
            </p>

            <ul className="mt-4 space-y-4">
              {todaysRows.map(({ dose, medication, status }) => (
                <li
                  key={occurrenceKey(dose)}
                  className={`rounded-2xl border-2 bg-surface p-5 md:p-6 ${
                    status === "given"
                      ? "border-given"
                      : status === "not-given"
                        ? "border-not-given"
                        : "border-line"
                  }`}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <MedicationImage className="mt-1" medication={medication} size="small" />
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold">
                          {medication.name}
                          <span className="sr-only">, {formatTime(dose.timeOfDay)}</span>
                        </h3>
                        <p className="mt-1 font-bold text-ink-soft">
                          {medication.strength} · {medication.form}
                        </p>
                        {medication.purpose && (
                          <p className="mt-1 text-base text-ink-muted">For: {medication.purpose}</p>
                        )}
                        {medication.instructions && (
                          <p className="mt-1 text-base text-ink-muted">
                            {carerName || "Carer"}’s note: {medication.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t border-line pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="w-24 text-center" aria-hidden="true">
                        <p className="text-xl font-bold">{timeParts(dose.timeOfDay).clock}</p>
                        <p className="text-sm font-bold text-ink-muted">
                          {timeParts(dose.timeOfDay).period}
                        </p>
                      </div>
                      {dose.event === null ? (
                        <div className="flex flex-1 flex-wrap items-center gap-2 md:flex-none">
                          {unloggedStatusLabel[status] && (
                            <p
                              className={`rounded-full px-3 py-1 text-sm font-bold ${
                                status === "overdue"
                                  ? "bg-highlight text-on-highlight"
                                  : "bg-accent-subtle text-accent"
                              }`}
                            >
                              {unloggedStatusLabel[status]}
                            </p>
                          )}
                          <button
                            aria-label={`Given: log the ${formatTime(dose.timeOfDay)} dose of ${medication.name} as given`}
                            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary md:flex-none"
                            onClick={() => markGiven(dose, "carer")}
                            type="button"
                          >
                            <Icon name="check" className="h-4 w-4" />
                            Given
                          </button>
                          <button
                            aria-label={`Not given: log the ${formatTime(dose.timeOfDay)} dose of ${medication.name} as not given`}
                            className="min-h-12 rounded-xl border-2 border-line-strong px-4 text-sm font-bold text-ink hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            onClick={() => setReasonFor({ dose, recordedBy: "carer" })}
                            type="button"
                          >
                            Not given
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                            status === "given"
                              ? "bg-given-subtle text-given"
                              : "bg-not-given-subtle text-not-given"
                          }`}
                          id={`dose-outcome-${occurrenceKey(dose)}`}
                          tabIndex={-1}
                        >
                          <Icon name={status === "given" ? "check" : "close"} className="h-4 w-4" />
                          <span className="sr-only">
                            {medication.name}, {formatTime(dose.timeOfDay)}:
                          </span>{" "}
                          {status === "given" ? "Given" : "Not given"}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {children}
    </CarerPage>
  );
}
