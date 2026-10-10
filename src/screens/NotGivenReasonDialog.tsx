import { Dialog } from "../components/Dialog";
import { FieldError } from "../components/FieldError";
import type { NotGivenReason } from "../model/types";
import { useFormErrors } from "../state/useFormErrors";
import type { Details } from "../storage/repository";
import { reasonLabel } from "./format";

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
  reason,
  saveNotGiven,
  setReason,
  setReasonFor,
}: {
  details: Details;
  reason: NotGivenReason | "";
  saveNotGiven: () => void;
  setReason: (reason: NotGivenReason) => void;
  setReasonFor: (value: null) => void;
}) {
  const { patientName } = details;
  // The error belongs to the whole group, and focus goes to its first option.
  const firstReasonId = `reason-${notGivenReasons[0]}`;
  const { checkOnSubmit, errors } = useFormErrors(
    reason ? {} : { [firstReasonId]: "Choose the reason this dose was not given." },
  );

  return (
    <Dialog
      closeLabel="Close"
      header={
        <>
          <p className="text-sm font-bold text-not-given">Dose not given</p>
          <h2 id="reason-title" className="mt-1 text-2xl font-bold">
            Why was this dose not given?
          </h2>
          <p className="mt-2 text-base leading-6 text-ink-muted">
            Record what happened when you offered this medicine to {patientName}.
            This information will be added to the patient’s care log.
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
          Reason the dose was not given to {patientName}
        </legend>
        {notGivenReasons.map((option) => (
          <label
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition ${
              reason === option
                ? "border-accent bg-accent-subtle text-ink"
                : "border-line-strong hover:bg-surface-muted"
            }`}
            key={option}
          >
            <input
              checked={reason === option}
              className="h-5 w-5 accent-accent"
              id={`reason-${option}`}
              name="missed-reason"
              onChange={() => setReason(option)}
              type="radio"
              value={option}
            />
            {reasonLabel(option, patientName)}
          </label>
        ))}
      </fieldset>
      <FieldError id="reason-error" message={errors[firstReasonId]} />
      <div className="mt-7 flex gap-3">
        <button
          className="min-h-12 flex-1 rounded-xl border border-line-strong px-4 text-sm font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={() => setReasonFor(null)}
          type="button"
        >
          Cancel
        </button>
        <button
          className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
          onClick={() => {
            if (checkOnSubmit()) saveNotGiven();
          }}
          type="button"
        >
          Save to care log
        </button>
      </div>
    </Dialog>
  );
}
