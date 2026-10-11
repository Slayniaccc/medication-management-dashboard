import { FieldError } from "../components/FieldError";
import { Icon } from "../components/Icon";
import { isLocalDate } from "../model/time";
import { useFormErrors } from "../state/useFormErrors";
import type { Details } from "../storage/repository";
import { formatDate } from "./format";
import { mainId, viewHeadingId, type Screen } from "./navigation";

export function ProfileScreen({
  carerInitials,
  details,
  editingCarer,
  goTo,
  patientInitials,
  setCarerAvailability,
  setCarerEmail,
  setCarerName,
  setCarerPhone,
  setCarerRelationship,
  setEditingCarer,
}: {
  carerInitials: string;
  details: Details;
  editingCarer: boolean;
  goTo: (screen: Screen) => void;
  patientInitials: string;
  setCarerAvailability: (value: string) => void;
  setCarerEmail: (value: string) => void;
  setCarerName: (value: string) => void;
  setCarerPhone: (value: string) => void;
  setCarerRelationship: (value: string) => void;
  setEditingCarer: (editing: boolean) => void;
}) {
  const {
    allowMedicineChanges,
    carerAvailability,
    carerEmail,
    carerName,
    carerPhone,
    carerRelationship,
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

  // The name is the heading of this page and of the carer's card, so it is
  // the one detail that cannot be left empty.
  const { checkOnSubmit, errors } = useFormErrors(
    carerName.trim() ? {} : { "carer-name": "Enter your name." },
  );

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-highlight">
              <Icon name="medication" />
            </div>
            <div>
              <p className="font-bold">AccessCare</p>
              <p className="text-sm text-ink-muted">Your details</p>
            </div>
          </div>
          <button
            className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => goTo("dashboard")}
            type="button"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main
        className="mx-auto max-w-6xl px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-8 md:py-10"
        id={mainId}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
              Your details
            </p>
            <h1
              className="mt-2 text-3xl font-bold tracking-tight focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-4xl"
              id={viewHeadingId}
              tabIndex={-1}
            >
              {carerName || "Your details"}
            </h1>
            <p className="mt-2 text-lg text-ink-muted">
              Your own details, and what you have entered about{" "}
              {patientName || "the person you support"}.
            </p>
          </div>
          <button
            className="min-h-12 rounded-xl border-2 border-accent px-5 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={() => goTo("setup")}
            type="button"
          >
            Edit patient setup
          </button>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-7">
            <section
              aria-labelledby="patient-profile-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold text-ink">
                  {patientInitials}
                </div>
                <div>
                  <h2 id="patient-profile-heading" className="text-2xl font-bold">
                    Patient information
                  </h2>
                  <p className="mt-1 text-ink-muted">The person you support</p>
                </div>
              </div>
              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Name</dt>
                  <dd className="mt-1 text-lg font-bold">{patientName || "Not entered"}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Age</dt>
                  <dd className="mt-1 text-lg font-bold">{patientAge || "Not entered"}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-4 sm:col-span-2">
                  <dt className="text-sm font-bold text-ink-muted">Who logs doses</dt>
                  <dd className="mt-1 text-lg font-bold">
                    {allowMedicineChanges
                      ? "You, and the patient from the patient view"
                      : "You, from the dashboard"}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="diagnosis-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <h2 id="diagnosis-heading" className="text-2xl font-bold">
                Conditions and needs, as you entered them
              </h2>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="font-bold">Medical conditions and care notes</h3>
                  <p className="mt-2 rounded-xl bg-surface-muted p-4 leading-7 text-ink-soft">
                    {medicalNeeds || "Nothing entered. Add it in patient setup."}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold">Disabilities and accessibility needs</h3>
                  <p className="mt-2 rounded-xl bg-surface-muted p-4 leading-7 text-ink-soft">
                    {disabilities || "Nothing entered. Add it in patient setup."}
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="profile-preferences-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <h2 id="profile-preferences-heading" className="text-2xl font-bold">
                How the patient view is set up
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  `Theme: ${patientTheme.replace("-", " ")}`,
                  `Text size: ${textSize.replace("-", " ")}`,
                  `Read aloud button: ${readAloud ? "on" : "off"}`,
                  `Colours that do not rely on red and green: ${colourSafe ? "on" : "off"}`,
                  `Simplified patient view: ${simplifiedLayout ? "on" : "off"}`,
                  `Reduce motion: ${reducedMotion ? "on" : "off"}`,
                ].map((preference) => (
                  <li
                    className="rounded-xl border border-line-strong px-4 py-3 font-bold"
                    key={preference}
                  >
                    {preference}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-7">
            <section
              aria-labelledby="carer-profile-heading"
              className="rounded-2xl border-2 border-accent bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                  {carerInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="carer-profile-heading" className="text-xl font-bold">
                    {carerName || "You"}
                  </h2>
                  <p className="text-sm text-ink-muted">Carer</p>
                </div>
                {!editingCarer && (
                  <button
                    className="min-h-11 rounded-lg px-3 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                    onClick={() => setEditingCarer(true)}
                    type="button"
                  >
                    Edit<span className="sr-only"> your details</span>
                  </button>
                )}
              </div>
              {editingCarer ? (
                <div className="mt-6 space-y-4">
                  {[
                    ["carer-name", "Your name", carerName, setCarerName, "text"],
                    ["carer-phone", "Phone number", carerPhone, setCarerPhone, "tel"],
                    ["carer-email", "Email address", carerEmail, setCarerEmail, "email"],
                    [
                      "carer-relationship",
                      "Relationship to patient",
                      carerRelationship,
                      setCarerRelationship,
                      "text",
                    ],
                    [
                      "carer-availability",
                      "Availability",
                      carerAvailability,
                      setCarerAvailability,
                      "text",
                    ],
                  ].map(([id, label, value, setter, type]) => (
                    <div key={id as string}>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-bold text-ink-muted">
                          {label as string}
                        </span>
                        <input
                          aria-describedby={errors[id as string] ? `${id}-error` : undefined}
                          aria-invalid={errors[id as string] ? true : undefined}
                          aria-required={id === "carer-name" ? "true" : undefined}
                          className="min-h-12 w-full rounded-xl border-2 border-line-strong px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger"
                          id={id as string}
                          onChange={(event) =>
                            (setter as (value: string) => void)(event.target.value)
                          }
                          type={type as string}
                          value={value as string}
                        />
                      </label>
                      <FieldError id={`${id}-error`} message={errors[id as string]} />
                    </div>
                  ))}
                  <button
                    className="min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                    onClick={() => {
                      if (checkOnSubmit()) setEditingCarer(false);
                    }}
                    type="button"
                  >
                    Save your details
                  </button>
                </div>
              ) : (
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Phone</dt>
                    <dd className="mt-1 font-bold">{carerPhone || "Not entered"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Email</dt>
                    <dd className="mt-1 break-words font-bold">{carerEmail || "Not entered"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Relationship</dt>
                    <dd className="mt-1 font-bold">{carerRelationship || "Not entered"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Availability</dt>
                    <dd className="mt-1 font-bold">{carerAvailability || "Not entered"}</dd>
                  </div>
                </dl>
              )}
            </section>

            <section
              aria-labelledby="consent-profile-heading"
              className={`rounded-2xl border-2 p-6 ${
                consentGiven
                  ? "border-accent bg-accent-subtle"
                  : "border-danger bg-danger-subtle"
              }`}
            >
              <h2 id="consent-profile-heading" className="text-xl font-bold">
                Consent record
              </h2>
              <div className="mt-4 flex items-center gap-2 font-bold">
                <Icon
                  name={consentGiven ? "check" : "close"}
                  className={`h-5 w-5 ${
                    consentGiven ? "text-accent" : "text-danger"
                  }`}
                />
                {consentGiven ? "Consent recorded" : "Consent not recorded yet"}
              </div>
              {consentGiven ? (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-bold text-ink-muted">How consent was given</dt>
                    <dd className="mt-1">{consentMethod}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink-muted">Date recorded</dt>
                    <dd className="mt-1">
                      {isLocalDate(consentDate) ? formatDate(consentDate) : consentDate}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 leading-6 text-ink">
                  Record {patientName || "the patient"}’s consent in patient setup.
                </p>
              )}
              <button
                className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => goTo("setup")}
                type="button"
              >
                {consentGiven ? "Review consent" : "Record consent"}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
