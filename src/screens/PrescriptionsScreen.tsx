import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Icon } from "../components/Icon";
import { MedicationImage } from "../components/MedicationImage";
import type { LocalDate } from "../model/time";
import type { Medication } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";
import { dayLabel } from "./format";

export function PrescriptionsScreen({
  activeMedications,
  addBackPrescription,
  children,
  details,
  now,
  reminderTimesFor,
  removePrescription,
  removedPrescriptions,
  setShowAddPrescription,
  shell,
}: {
  activeMedications: Medication[];
  addBackPrescription: (medicationId: string) => void;
  // The add prescription dialog.
  children: ReactNode;
  details: Details;
  now: Date;
  reminderTimesFor: (medicationId: string) => string[];
  removePrescription: (medicationId: string) => void;
  removedPrescriptions: Array<{ medication: Medication; removedOn: LocalDate; times: string[] }>;
  setShowAddPrescription: (show: boolean) => void;
  shell: CarerPageShell;
}) {
  const { carerName, patientName } = details;
  const patient = patientName || "the person you support";
  // Which medicine is being asked about. Removing takes two presses.
  const [confirming, setConfirming] = useState<string | null>(null);

  // Each of these takes away the button that was pressed, so the change is
  // made first and focus is then put on what replaced it.
  const moveFocus = (change: () => void, toId: string) => {
    flushSync(change);
    document.getElementById(toId)?.focus();
  };

  return (
    <CarerPage
      {...shell}
      action={
        <button
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
          onClick={() => setShowAddPrescription(true)}
          type="button"
        >
          <Icon name="plus" />
          Add prescription
        </button>
      }
      description={
        activeMedications.length === 0
          ? `No prescriptions for ${patient} yet.`
          : `${activeMedications.length} ${
              activeMedications.length === 1 ? "prescription" : "prescriptions"
            } for ${patient}, as you entered them.`
      }
      eyebrow="Medicines"
      title="Prescriptions"
    >
      {activeMedications.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 text-base leading-7 text-ink-soft">
          Add a prescription with the button above. It is listed here with its reminder times,
          and its doses appear on the dashboard each day.
        </p>
      )}

      <ul className="grid gap-5 xl:grid-cols-2" hidden={activeMedications.length === 0}>
        {activeMedications.map((medication) => (
          <li className="rounded-2xl border border-line bg-surface p-6" key={medication.id}>
            <div className="flex items-start gap-4">
              <MedicationImage medication={medication} size="large" />
              <div className="min-w-0">
                <h2 className="text-xl font-bold">{medication.name}</h2>
                <p className="mt-1 font-bold text-ink-soft">
                  {medication.strength} · {medication.form}
                </p>
                {medication.purpose && (
                  <p className="mt-1 text-ink-muted">For: {medication.purpose}</p>
                )}
              </div>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-sm font-bold text-ink-muted">Reminder times</dt>
                <dd className="mt-1 font-bold">{reminderTimesFor(medication.id).join(", ")}</dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-sm font-bold text-ink-muted">{carerName || "Carer"}’s note</dt>
                <dd className="mt-1">{medication.instructions || "No note entered"}</dd>
              </div>
            </dl>
            {confirming === medication.id ? (
              <div
                aria-labelledby={`confirm-${medication.id}`}
                className="mt-5 rounded-xl border-2 border-danger p-4"
                role="group"
              >
                <p className="font-bold" id={`confirm-${medication.id}`}>
                  Remove {medication.name}?
                </p>
                <p className="mt-1 text-base text-ink-soft" id={`confirm-detail-${medication.id}`}>
                  Its doses stop appearing from today. Doses already logged stay in the medicine
                  log, and you can add it back from this page.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    aria-describedby={`confirm-detail-${medication.id}`}
                    className="min-h-12 flex-1 rounded-xl border-2 border-line-strong px-4 text-sm font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    id={`keep-${medication.id}`}
                    onClick={() => moveFocus(() => setConfirming(null), `remove-${medication.id}`)}
                    type="button"
                  >
                    Keep {medication.name}
                  </button>
                  <button
                    className="min-h-12 flex-1 rounded-xl bg-danger px-4 text-sm font-bold text-on-danger focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onClick={() =>
                      moveFocus(() => {
                        setConfirming(null);
                        removePrescription(medication.id);
                      }, `add-back-${medication.id}`)
                    }
                    type="button"
                  >
                    Remove {medication.name}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="mt-5 min-h-11 rounded-xl border-2 border-danger px-4 text-sm font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                id={`remove-${medication.id}`}
                // The safe answer gets focus, so a second press of the same
                // key does not remove anything.
                onClick={() =>
                  moveFocus(() => setConfirming(medication.id), `keep-${medication.id}`)
                }
                type="button"
              >
                Remove<span className="sr-only"> {medication.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>

      {removedPrescriptions.length > 0 && (
        <section aria-labelledby="removed-heading" className="mt-10">
          <h2 id="removed-heading" className="text-2xl font-bold">
            Removed prescriptions
          </h2>
          <p className="mt-1 text-base text-ink-muted">
            Their logged doses are still in the medicine log. Adding one back starts it again
            from today at the same times.
          </p>
          <ul className="mt-4 space-y-3">
            {removedPrescriptions.map(({ medication, removedOn, times }) => (
              <li
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
                key={medication.id}
              >
                <div>
                  <h3 className="text-lg font-bold">{medication.name}</h3>
                  <p className="mt-1 text-base text-ink-muted">
                    {medication.strength} · {medication.form} · {times.join(", ")} · Removed{" "}
                    {dayLabel(removedOn, now).toLowerCase()}
                  </p>
                </div>
                <button
                  className="min-h-11 shrink-0 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  id={`add-back-${medication.id}`}
                  onClick={() =>
                    moveFocus(() => addBackPrescription(medication.id), `remove-${medication.id}`)
                  }
                  type="button"
                >
                  Add back<span className="sr-only"> {medication.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}
    </CarerPage>
  );
}
