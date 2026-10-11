import type { Dispatch, SetStateAction } from "react";
import { flushSync } from "react-dom";
import { ExampleNotice } from "../components/ExampleNotice";
import { FieldError } from "../components/FieldError";
import { Icon } from "../components/Icon";
import { ToggleRow } from "../components/ToggleRow";
import { useFormErrors, type FormErrors } from "../state/useFormErrors";
import type { Details, PatientTheme, TextSize } from "../storage/repository";
import { mainId, viewHeadingId, type Screen } from "./navigation";

export function SetupScreen({
  details,
  flashToast,
  goTo,
  setAllowMedicineChanges,
  setColourSafe,
  setConsentDate,
  setConsentGiven,
  setConsentMethod,
  setDisabilities,
  setMedicalNeeds,
  setPatientAge,
  setPatientName,
  setPatientTheme,
  setReadAloud,
  setReducedMotion,
  setSimplifiedLayout,
  setTextSize,
}: {
  details: Details;
  flashToast: (message: string) => void;
  goTo: (screen: Screen) => void;
  setAllowMedicineChanges: Dispatch<SetStateAction<boolean>>;
  setColourSafe: Dispatch<SetStateAction<boolean>>;
  setConsentDate: (value: string) => void;
  setConsentGiven: (given: boolean) => void;
  setConsentMethod: (value: string) => void;
  setDisabilities: (value: string) => void;
  setMedicalNeeds: (value: string) => void;
  setPatientAge: (value: string) => void;
  setPatientName: (value: string) => void;
  setPatientTheme: (theme: PatientTheme) => void;
  setReadAloud: Dispatch<SetStateAction<boolean>>;
  setReducedMotion: Dispatch<SetStateAction<boolean>>;
  setSimplifiedLayout: Dispatch<SetStateAction<boolean>>;
  setTextSize: (size: TextSize) => void;
}) {
  const {
    allowMedicineChanges,
    carerName,
    colourSafe,
    consentDate,
    consentGiven,
    consentMethod,
    disabilities,
    medicalNeeds,
    patientAge,
    patientName,
    patientTheme,
    readAloud,
    reducedMotion,
    simplifiedLayout,
    textSize,
  } = details;

  const found: FormErrors = {};
  if (!consentDate) found["consent-date"] = "Enter the date consent was recorded.";
  if (!consentGiven) {
    found["consent-given"] = "Tick the box to confirm consent before saving the patient setup.";
  }
  const { checkOnSubmit, errors } = useFormErrors(found);

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-highlight">
              <Icon name="medication" />
            </div>
            <div>
              <p className="font-bold">AccessCare</p>
              <p className="text-sm text-ink-muted">Patient setup</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="hidden min-h-11 items-center gap-2 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex"
              onClick={() => goTo("patient")}
              type="button"
            >
              <Icon name="home" className="h-4 w-4" />
              Go to Patient view
            </button>
            <button
              className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
              onClick={() => goTo("dashboard")}
              type="button"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </header>

      <main
        className="mx-auto max-w-7xl px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-8 md:py-10"
        id={mainId}
        tabIndex={-1}
      >
        <ExampleNotice exampleData={details.exampleData} />
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
            Patient setup
          </p>
          <h1
            className="mt-2 text-3xl font-bold tracking-tight focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-4xl"
            id={viewHeadingId}
            tabIndex={-1}
          >
            Set up the patient view{patientName ? ` for ${patientName}` : ""}
          </h1>
          <p className="mt-3 text-lg leading-7 text-ink-muted">
            Who the patient is, how the patient view looks for them, what they can do in it,
            and their consent to you keeping these records.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-7">
            <section
              aria-labelledby="patient-details-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon name="home" />
                </span>
                <h2 id="patient-details-heading" className="text-xl font-bold">
                  Patient details and needs
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 block font-bold">Patient name</span>
                  <input
                    className="min-h-12 w-full rounded-xl border-2 border-line-strong px-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onChange={(event) => setPatientName(event.target.value)}
                    type="text"
                    value={patientName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-bold">Patient age</span>
                  <input
                    className="min-h-12 w-full rounded-xl border-2 border-line-strong px-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    inputMode="numeric"
                    min="0"
                    onChange={(event) => setPatientAge(event.target.value)}
                    type="number"
                    value={patientAge}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-bold">
                    Disabilities and accessibility needs
                  </span>
                  <span className="mb-2 block text-sm text-ink-muted">
                    Describe vision, hearing, mobility, memory, learning, or communication
                    needs.
                  </span>
                  <textarea
                    className="min-h-28 w-full rounded-xl border-2 border-line-strong p-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onChange={(event) => setDisabilities(event.target.value)}
                    value={disabilities}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-bold">Medical conditions and care notes</span>
                  <span className="mb-2 block text-sm text-ink-muted">
                    Write only what is useful to you. It is kept on this device and shown on
                    your details page.
                  </span>
                  <textarea
                    className="min-h-28 w-full rounded-xl border-2 border-line-strong p-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onChange={(event) => setMedicalNeeds(event.target.value)}
                    value={medicalNeeds}
                  />
                </label>
              </div>
            </section>

            <section
              aria-labelledby="permissions-heading"
              className="rounded-2xl border-2 border-accent bg-surface p-6 md:p-7"
            >
              <h2 id="permissions-heading" className="text-xl font-bold">
                What the patient can do
              </h2>
              <p className="mt-2 text-base leading-6 text-ink-muted">
                Choose whether {patientName || "the patient"} logs their own doses. You can
                change this at any time.
              </p>
              <div className="mt-4">
                <ToggleRow
                  checked={allowMedicineChanges}
                  description="Adds buttons to the patient view for recording a medicine as taken or not taken, and for adding a prescription."
                  label="Let the patient log doses and add prescriptions"
                  onChange={() => setAllowMedicineChanges((value) => !value)}
                />
              </div>
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                  allowMedicineChanges
                    ? "bg-accent-subtle text-accent"
                    : "bg-surface-sunken text-ink"
                }`}
              >
                {allowMedicineChanges
                  ? "On. Doses can be logged from the patient view as well as from the dashboard."
                  : "Off. The patient view shows the medicines, and doses are logged from the dashboard."}
              </div>
            </section>

            <section
              aria-labelledby="consent-heading"
              className="rounded-2xl border-2 border-danger bg-surface p-6 md:p-7"
            >
              <p className="text-sm font-bold text-danger">Needed before this page can be saved</p>
              <h2 id="consent-heading" className="mt-1 text-xl font-bold">
                Patient consent
              </h2>
              <p className="mt-2 leading-6 text-ink-muted">
                Go through this statement with {patientName || "the patient"} in whatever way
                works for them, with time for questions, and record their answer below.
              </p>

              <blockquote className="mt-5 rounded-xl border-l-4 border-accent bg-surface-muted p-4 leading-7 text-ink">
                “I, {patientName || "the patient"}, agree to {carerName || "my carer"} keeping
                a record of my medicines, when they are due and whether each dose was taken,
                in AccessCare on this device. I know what is being written down, and that I
                can ask to see it, change it or stop it.”
              </blockquote>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-bold">How consent was given</span>
                  <select
                    className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onChange={(event) => setConsentMethod(event.target.value)}
                    value={consentMethod}
                  >
                    <option>Confirmed directly by patient</option>
                    <option>Written consent</option>
                    <option>Verbal consent with witness</option>
                    <option>Authorised representative</option>
                  </select>
                </label>
                <div>
                  <label className="block">
                    <span className="mb-2 block font-bold">Date consent recorded</span>
                    <input
                      aria-describedby={errors["consent-date"] ? "consent-date-error" : undefined}
                      aria-invalid={errors["consent-date"] ? true : undefined}
                      aria-required="true"
                      className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger"
                      id="consent-date"
                      onChange={(event) => setConsentDate(event.target.value)}
                      type="date"
                      value={consentDate}
                    />
                  </label>
                  <FieldError id="consent-date-error" message={errors["consent-date"]} />
                </div>
              </div>

              <label
                className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                  consentGiven
                    ? "border-accent bg-accent-subtle"
                    : errors["consent-given"]
                      ? "border-danger bg-surface"
                      : "border-line-strong bg-surface"
                }`}
              >
                <input
                  aria-describedby={errors["consent-given"] ? "consent-given-error" : undefined}
                  aria-invalid={errors["consent-given"] ? true : undefined}
                  aria-required="true"
                  checked={consentGiven}
                  className="mt-0.5 h-6 w-6 shrink-0 accent-accent"
                  id="consent-given"
                  onChange={(event) => setConsentGiven(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="block font-bold">
                    I confirm that {patientName || "the patient"} agreed to this statement.
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-ink-muted">
                    They agreed freely, after it was gone through in a way they could
                    understand.
                  </span>
                </span>
              </label>
              <FieldError id="consent-given-error" message={errors["consent-given"]} />
            </section>
          </div>

          <section
            aria-labelledby="accessibility-heading"
            className="rounded-2xl border border-line bg-surface p-6 md:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name="settings" />
              </span>
              <h2 id="accessibility-heading" className="text-xl font-bold">
                How the patient view looks and sounds
              </h2>
            </div>

            <fieldset className="mt-7">
              <legend className="font-bold">Theme and contrast</legend>
              <p className="mt-1 text-sm text-ink-muted">
                Choose the most comfortable background and contrast level.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    ["light", "Light"],
                    ["high-contrast", "High contrast"],
                    ["dark", "Dark"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    aria-pressed={patientTheme === value}
                    className={`flex min-h-14 items-center justify-center gap-1 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                      patientTheme === value
                        ? "border-accent bg-accent-subtle text-ink"
                        : "border-line-strong bg-surface text-ink-muted"
                    }`}
                    key={value}
                    onClick={() => setPatientTheme(value)}
                    type="button"
                  >
                    {/* The tick, so the choice does not rest on colour alone. */}
                    {patientTheme === value && <Icon name="check" className="h-4 w-4 shrink-0" />}
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="font-bold">Text size</legend>
              <p className="mt-1 text-sm text-ink-muted">
                The patient can still zoom using their browser or device.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    ["standard", "Standard"],
                    ["large", "Large"],
                    ["extra-large", "Extra large"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    aria-pressed={textSize === value}
                    className={`flex min-h-14 items-center justify-center gap-1 rounded-xl border-2 px-2 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                      textSize === value
                        ? "border-accent bg-accent-subtle text-ink"
                        : "border-line-strong bg-surface text-ink-muted"
                    } ${value === "standard" ? "text-sm" : value === "large" ? "text-base" : "text-lg"}`}
                    key={value}
                    onClick={() => setTextSize(value)}
                    type="button"
                  >
                    {textSize === value && <Icon name="check" className="h-4 w-4 shrink-0" />}
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7">
              <ToggleRow
                checked={readAloud}
                description={`For someone who does not use a screen reader. Adds a button to the patient view that speaks the next medicine in this device’s own voice, and only when it is pressed. A screen reader already reads the whole page, and two voices at once are harder to follow than one.${
                  "speechSynthesis" in window ? "" : " This browser has no voice to read with."
                }`}
                label="Read aloud button, in place of a screen reader"
                onChange={() => setReadAloud((value) => !value)}
              />
              <ToggleRow
                checked={colourSafe}
                description="Shows taken and not taken in blue and orange in place of green and red. An icon and the words are always shown as well, whatever this is set to."
                label="Colours that do not rely on red and green"
                onChange={() => setColourSafe((value) => !value)}
              />
              <ToggleRow
                checked={simplifiedLayout}
                description="Shows the next medicine and how to reach you, and leaves out the list of the day’s other medicines."
                label="Simplified patient view"
                onChange={() => setSimplifiedLayout((value) => !value)}
              />
              <ToggleRow
                checked={reducedMotion}
                description="Stops the sliding and fading between states, on every page of the app. If this device is already set to reduce motion, that is followed whatever this is set to."
                label="Reduce motion"
                onChange={() => setReducedMotion((value) => !value)}
              />
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col justify-end gap-3 rounded-2xl bg-inverse p-5 sm:flex-row">
          <button
            className="min-h-12 rounded-xl border-2 border-on-inverse px-5 text-sm font-bold text-on-inverse hover:bg-on-inverse/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse"
            onClick={() => goTo("patient")}
            type="button"
          >
            Go to Patient view
          </button>
          <button
            className="min-h-12 rounded-xl bg-highlight px-6 text-sm font-bold text-on-highlight hover:bg-on-inverse focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-on-inverse"
            onClick={() => {
              if (!checkOnSubmit()) return;
              // The dashboard is drawn first, so its status region is in the
              // document and empty when the message arrives. A region that
              // arrives already holding its message is not reliably spoken.
              flushSync(() => goTo("dashboard"));
              flashToast("Patient setup saved.");
            }}
            type="button"
          >
            Save patient setup
          </button>
        </div>
      </main>
    </div>
  );
}
