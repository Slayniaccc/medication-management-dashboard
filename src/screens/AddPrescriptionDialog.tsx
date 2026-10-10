import type { Dispatch, SetStateAction } from "react";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import type { TimeOfDay } from "../model/time";
import type { Medication } from "../model/types";
import { formatTime } from "./format";

const reminderTimeOptions: TimeOfDay[] = ["08:00", "12:00", "18:00", "21:00"];

export function AddPrescriptionDialog({
  medications,
  medicineImage,
  newDosage,
  newQuantity,
  newTimes,
  prescriptionIsComplete,
  savePrescription,
  setMedicineImage,
  setNewDosage,
  setNewQuantity,
  setNewTimes,
  setShowAddPrescription,
}: {
  medications: Medication[];
  medicineImage: string;
  newDosage: string;
  newQuantity: string;
  newTimes: string[];
  prescriptionIsComplete: boolean;
  savePrescription: () => void;
  setMedicineImage: (image: string) => void;
  setNewDosage: (value: string) => void;
  setNewQuantity: (value: string) => void;
  setNewTimes: Dispatch<SetStateAction<string[]>>;
  setShowAddPrescription: (show: boolean) => void;
}) {
  return (
    <Dialog
      closeLabel="Close add prescription dialog"
      header={
        <>
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
            Manage prescriptions
          </p>
          <h2 id="prescription-title" className="mt-1 text-2xl font-bold">
            Add a new prescription
          </h2>
          <p className="mt-2 text-base text-ink-muted">
            The prescription will be added as Medicine {medications.length + 1}.
          </p>
        </>
      }
      labelledBy="prescription-title"
      onClose={() => setShowAddPrescription(false)}
      width="wide"
    >
      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-base font-bold">
            Medicine photo <span className="font-normal text-ink-muted">(optional)</span>
          </span>
          <span className="flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-surface-muted p-4 text-center transition hover:bg-surface-sunken focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-line">
            <input
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                // Read into the record itself. An object URL only points at
                // this page's memory and would be dead after a refresh.
                const reader = new FileReader();
                reader.onload = () => setMedicineImage(String(reader.result));
                reader.readAsDataURL(file);
              }}
              type="file"
            />
            {medicineImage ? (
              <span className="flex items-center gap-4">
                <img
                  alt="Selected medicine preview"
                  className="h-20 w-20 rounded-xl border border-line-strong object-cover"
                  src={medicineImage}
                />
                <span className="text-left">
                  <span className="block font-bold text-ink">Photo added</span>
                  <span className="mt-1 block text-sm text-ink-muted">
                    Select to choose a different photo
                  </span>
                </span>
              </span>
            ) : (
              <span>
                <Icon name="image" className="mx-auto h-7 w-7 text-accent" />
                <span className="mt-2 block font-bold text-ink">
                  Add a photo of the medicine
                </span>
                <span className="mt-1 block text-sm text-ink-muted">
                  Use a clear photo of the packaging or label
                </span>
              </span>
            )}
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-base font-bold">Dosage</span>
            <input
              className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:ring-3 focus:ring-accent-line"
              onChange={(event) => setNewDosage(event.target.value)}
              placeholder="For example: 20 mg"
              type="text"
              value={newDosage}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-base font-bold">Quantity</span>
            <input
              className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:ring-3 focus:ring-accent-line"
              onChange={(event) => setNewQuantity(event.target.value)}
              placeholder="For example: 1 tablet"
              type="text"
              value={newQuantity}
            />
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-base font-bold">Reminder times</legend>
          <p className="mb-3 text-sm text-ink-muted">
            Add every time this medicine should be given.
          </p>
          <div className="space-y-3">
            {newTimes.map((reminderTime, index) => (
              <div className="flex items-center gap-2" key={index}>
                <label className="sr-only" htmlFor={`reminder-${index}`}>
                  Reminder time {index + 1}
                </label>
                <select
                  className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-line-strong bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                  id={`reminder-${index}`}
                  onChange={(event) =>
                    setNewTimes((times) =>
                      times.map((time, timeIndex) =>
                        timeIndex === index ? event.target.value : time,
                      ),
                    )
                  }
                  value={reminderTime}
                >
                  <option value="">Choose a time</option>
                  {reminderTimeOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatTime(option)}
                    </option>
                  ))}
                </select>
                {newTimes.length > 1 && (
                  <button
                    aria-label={`Remove reminder time ${index + 1}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-line-strong text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onClick={() =>
                      setNewTimes((times) =>
                        times.filter((_, timeIndex) => timeIndex !== index),
                      )
                    }
                    type="button"
                  >
                    <Icon name="close" className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="mt-3 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
            onClick={() => setNewTimes((times) => [...times, ""])}
            type="button"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add another reminder time
          </button>
        </fieldset>
      </div>

      <div className="mt-7 flex gap-3">
        <button
          className="min-h-12 flex-1 rounded-xl border border-line-strong px-4 text-sm font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={() => setShowAddPrescription(false)}
          type="button"
        >
          Cancel
        </button>
        <button
          className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
          disabled={!prescriptionIsComplete}
          onClick={savePrescription}
          type="button"
        >
          Add prescription
        </button>
      </div>
    </Dialog>
  );
}
