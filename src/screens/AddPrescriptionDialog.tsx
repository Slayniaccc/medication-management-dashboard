import { Dialog } from "../components/Dialog";
import { FieldError } from "../components/FieldError";
import { Icon } from "../components/Icon";
import type { TimeOfDay } from "../model/time";
import { useFormErrors, type FormErrors } from "../state/useFormErrors";
import type { PrescriptionDraft } from "../state/usePrescriptionDraft";
import { formatTime } from "./format";

const reminderTimeOptions: TimeOfDay[] = ["08:00", "12:00", "18:00", "21:00"];

const fieldClass =
  "min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger";

export function AddPrescriptionDialog({ draft }: { draft: PrescriptionDraft }) {
  const {
    medicineImage,
    newDosage,
    newName,
    newNote,
    newPurpose,
    newQuantity,
    newTimes,
    savePrescription,
    setMedicineImage,
    setNewDosage,
    setNewName,
    setNewNote,
    setNewPurpose,
    setNewQuantity,
    setNewTimes,
    setShowAddPrescription,
  } = draft;

  const found: FormErrors = {};
  if (!newName.trim()) found["prescription-name"] = "Enter the name of the medicine.";
  if (!newDosage.trim()) found["prescription-dosage"] = "Enter the strength, for example 20 mg.";
  if (!newQuantity.trim()) {
    found["prescription-quantity"] = "Enter the amount each time, for example 1 tablet.";
  }
  newTimes.forEach((time, index) => {
    if (time) return;
    found[`reminder-${index}`] =
      newTimes.length > 1
        ? `Choose a time for reminder ${index + 1}, or remove it.`
        : "Choose a reminder time.";
  });
  const { checkOnSubmit, errors } = useFormErrors(found);

  // The three required text fields are the same markup with different words.
  const textField = (
    id: string,
    label: string,
    hint: string,
    value: string,
    onChange: (value: string) => void,
    required: boolean,
  ) => (
    <div>
      <label className="mb-2 block text-base font-bold" htmlFor={id}>
        {label}
        {!required && <span className="font-normal text-ink-muted"> (optional)</span>}
      </label>
      <p className="mb-2 text-sm text-ink-muted" id={`${id}-hint`}>
        {hint}
      </p>
      <input
        aria-describedby={errors[id] ? `${id}-hint ${id}-error` : `${id}-hint`}
        aria-invalid={errors[id] ? true : undefined}
        aria-required={required ? "true" : undefined}
        className={fieldClass}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
      <FieldError id={`${id}-error`} message={errors[id]} />
    </div>
  );

  return (
    <Dialog
      closeLabel="Close without adding"
      header={
        <>
          <h2 id="prescription-title" className="text-2xl font-bold">
            Add a prescription
          </h2>
          <p className="mt-2 text-base text-ink-muted">
            Copy the details from the label or the prescription. AccessCare keeps what you type
            and shows it back to you. It does not check it.
          </p>
        </>
      }
      labelledBy="prescription-title"
      onClose={() => setShowAddPrescription(false)}
      width="wide"
    >
      <div className="mt-6 space-y-5">
        {textField(
          "prescription-name",
          "Medicine name",
          "As it is written on the label.",
          newName,
          setNewName,
          true,
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {textField(
            "prescription-dosage",
            "Strength",
            "For example 20 mg.",
            newDosage,
            setNewDosage,
            true,
          )}
          {textField(
            "prescription-quantity",
            "Amount each time",
            "For example 1 tablet.",
            newQuantity,
            setNewQuantity,
            true,
          )}
        </div>

        <fieldset>
          <legend className="mb-2 text-base font-bold">Reminder times</legend>
          <p className="mb-3 text-sm text-ink-muted">
            One for each time of day this medicine is due. The dose appears on the dashboard at
            that time. AccessCare does not sound an alarm.
          </p>
          <div className="space-y-3">
            {newTimes.map((reminderTime, index) => (
              <div key={index}>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`reminder-${index}`}>
                    Reminder time {index + 1}
                  </label>
                  <select
                    aria-describedby={
                      errors[`reminder-${index}`] ? `reminder-${index}-error` : undefined
                    }
                    aria-invalid={errors[`reminder-${index}`] ? true : undefined}
                    aria-required="true"
                    className={`${fieldClass} min-w-0 flex-1`}
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
                <FieldError
                  id={`reminder-${index}-error`}
                  message={errors[`reminder-${index}`]}
                />
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

        {textField(
          "prescription-purpose",
          "What it is for",
          "In your own words, so you can tell your medicines apart.",
          newPurpose,
          setNewPurpose,
          false,
        )}
        {textField(
          "prescription-note",
          "Your note",
          "Anything you want shown with this medicine, such as what the label says about taking it. It is shown as your note.",
          newNote,
          setNewNote,
          false,
        )}

        <label className="block">
          <span className="mb-2 block text-base font-bold">
            Medicine photo <span className="font-normal text-ink-muted">(optional)</span>
          </span>
          <span className="flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-surface-muted p-4 text-center transition hover:bg-surface-sunken focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus">
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
                  alt="The photo you chose"
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
                <span className="mt-2 block font-bold text-ink">Add a photo of the medicine</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  The box or the label, so it is easy to recognise
                </span>
              </span>
            )}
          </span>
        </label>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          className="min-h-12 flex-1 rounded-xl border-2 border-line-strong px-4 text-base font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={() => setShowAddPrescription(false)}
          type="button"
        >
          Cancel
        </button>
        <button
          className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-base font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
          onClick={() => {
            if (checkOnSubmit()) savePrescription();
          }}
          type="button"
        >
          Add prescription
        </button>
      </div>
    </Dialog>
  );
}
