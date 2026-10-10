import { Icon } from "../components/Icon";
import { MedicationImage } from "../components/MedicationImage";
import type { Medication } from "../model/types";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";

export function PrescriptionsScreen({
  activeMedications,
  details,
  reminderTimesFor,
  removePrescription,
  setShowAddPrescription,
  setToast,
  shell,
}: {
  activeMedications: Medication[];
  details: Details;
  reminderTimesFor: (medicationId: string) => string[];
  removePrescription: (medicationId: string) => void;
  setShowAddPrescription: (show: boolean) => void;
  setToast: (message: string) => void;
  shell: CarerPageShell;
}) {
  const { patientName } = details;
  const { setScreen } = shell;

  return (
    <CarerPage
      {...shell}
      description={`Manage all ${activeMedications.length} prescriptions for ${patientName}.`}
      eyebrow="Medication management"
      title="Prescriptions"
    >
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => {
              setShowAddPrescription(true);
              setScreen("dashboard");
            }}
            type="button"
          >
            <Icon name="plus" />
            Add prescription
          </button>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {activeMedications.map((medication) => (
            <article
              className="rounded-2xl border border-line bg-surface p-6"
              key={medication.id}
            >
              <div className="flex items-start gap-4">
                <MedicationImage medication={medication} size="large" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{medication.name}</h2>
                  <p className="mt-1 font-bold text-ink-soft">
                    {medication.strength} · {medication.form}
                  </p>
                  <p className="mt-1 text-ink-muted">{medication.purpose}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-muted p-3">
                  <dt className="text-sm font-bold text-ink-muted">Instructions</dt>
                  <dd className="mt-1">{medication.instructions || "None entered"}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <dt className="text-sm font-bold text-ink-muted">Reminder times</dt>
                  <dd className="mt-1 font-bold">
                    {reminderTimesFor(medication.id).join(", ")}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-3">
                <button
                  className="min-h-11 flex-1 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => {
                    setToast(`${medication.name} selected for editing.`);
                    window.setTimeout(() => setToast(""), 2800);
                  }}
                  type="button"
                >
                  Edit prescription
                </button>
                <button
                  aria-label={`Remove ${medication.name}`}
                  className="min-h-11 rounded-xl border-2 border-danger px-4 text-sm font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => removePrescription(medication.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </CarerPage>
  );
}
