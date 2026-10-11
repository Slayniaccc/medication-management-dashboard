import { Dialog } from "../components/Dialog";
import { FieldError } from "../components/FieldError";
import type { NotGivenReason, OccurrenceKey, RecordedBy } from "../model/types";
import { useFormErrors } from "../state/useFormErrors";
import type { Details } from "../storage/repository";
import { formatTime, reasonLabel, reasonLabelForPatient } from "./format";

const notGivenReasons: NotGivenReason[] = [
  "refused",
  "asleep",
  "unwell",
  "unavailable",
  "withheld-on-clinical-advice",
  "carer-unable",
  "other",
];

export function NotGivenReasonDialog({
  details,
  dose,
  medicationName,
  reason,
  recordedBy,
  saveNotGiven,
  setReason,
  setReasonFor,
}: {
  details: Details;
  // Which dose is being logged, and the name of its medicine.
  dose: OccurrenceKey;
  medicationName: string;
  reason: NotGivenReason | "";
  // Who is logging, which decides whose words the dialog uses.
  recordedBy: RecordedBy;
  saveNotGiven: () => void;
  setReason: (reason: NotGivenReason) => void;
  setReasonFor: (value: null) => void;
}) {
  const { carerName, patientName } = details;
  const forPatient = recordedBy === "patient";
  // The error belongs to the whole group, and focus goes to its first option.
  const firstReasonId = `reason-${notGivenReasons[0]}`;
  const { checkOnSubmit, errors } = useFormErrors(
    reason
      ? {}
      : {
          [firstReasonId]: forPatient
            ? "Choose the reason you did not take it."
            : "Choose the reason this dose was not given.",
        },
  );

  return (
    <Dialog
      closeLabel={forPatient ? "Close without recording" : "Close without logging"}
      header={
        <>
          {/* The dose is part of the heading, so it is in the dialog's name: a
              press on the wrong row is heard and seen before anything is logged. */}
          <h2 id="reason-title" className="text-2xl font-bold">
            <span className="block text-lg text-ink-soft">
              {medicationName}, {formatTime(dose.timeOfDay)}
            </span>
            {forPatient ? "Why did you not take it?" : "Why was this dose not given?"}
          </h2>
          <p className="mt-2 text-base leading-6 text-ink-muted">
            The reason is kept with the dose in the medicine log.
          </p>
        </>
      }
      labelledBy="reason-title"
      onClose={() => setReasonFor(null)}
      width="narrow"
    >
      <fieldset
        aria-describedby={errors[firstReasonId] ? "reason-error" : undefined}
        aria-invalid={errors[firstReasonId] ? true : undefined}
        aria-required="true"
        className="mt-6 space-y-3"
        role="radiogroup"
      >
        <legend className="sr-only">
          {forPatient ? "Reason you did not take it" : "Reason the dose was not given"}
        </legend>
        {notGivenReasons.map((option) => (
          <label
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2 text-base font-bold transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus ${
              reason === option
                ? "border-accent bg-accent-subtle text-ink"
                : "border-line-strong hover:bg-surface-muted"
            }`}
            key={option}
          >
            <input
              checked={reason === option}
              className="h-5 w-5 shrink-0 accent-accent"
              id={`reason-${option}`}
              name="not-given-reason"
              onChange={() => setReason(option)}
              type="radio"
              value={option}
            />
            {forPatient
              ? reasonLabelForPatient(option, carerName)
              : reasonLabel(option, patientName, carerName)}
          </label>
        ))}
      </fieldset>
      <FieldError id="reason-error" message={errors[firstReasonId]} />
      <div className="mt-7 flex flex-wrap gap-3">
        <button
          className="min-h-12 flex-1 rounded-xl border-2 border-line-strong px-4 text-base font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={() => setReasonFor(null)}
          type="button"
        >
          Cancel
        </button>
        <button
          className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-base font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
          onClick={() => {
            if (checkOnSubmit()) saveNotGiven();
          }}
          type="button"
        >
          {forPatient ? "Record as not taken" : "Log as not given"}
        </button>
      </div>
    </Dialog>
  );
}
