import { Icon } from "../components/Icon";
import type { Details } from "../storage/repository";
import type { Screen } from "./navigation";

export function ProfileScreen({
  carerInitials,
  details,
  editingCarer,
  patientInitials,
  setCarerAvailability,
  setCarerEmail,
  setCarerName,
  setCarerPhone,
  setCarerRelationship,
  setEditingCarer,
  setScreen,
}: {
  carerInitials: string;
  details: Details;
  editingCarer: boolean;
  patientInitials: string;
  setCarerAvailability: (value: string) => void;
  setCarerEmail: (value: string) => void;
  setCarerName: (value: string) => void;
  setCarerPhone: (value: string) => void;
  setCarerRelationship: (value: string) => void;
  setEditingCarer: (editing: boolean) => void;
  setScreen: (screen: Screen) => void;
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
              <p className="text-sm text-ink-muted">Care profile</p>
            </div>
          </div>
          <button
            className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => setScreen("dashboard")}
            type="button"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
              My account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {carerName}
            </h1>
            <p className="mt-2 text-lg text-ink-muted">
              Manage your carer details and review the patient’s care information.
            </p>
          </div>
          <button
            className="min-h-12 rounded-xl border-2 border-accent px-5 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={() => setScreen("setup")}
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
                  <p className="mt-1 text-ink-muted">Primary patient receiving care</p>
                </div>
              </div>
              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Full name</dt>
                  <dd className="mt-1 text-lg font-bold">{patientName}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Age</dt>
                  <dd className="mt-1 text-lg font-bold">{patientAge}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Patient reference</dt>
                  <dd className="mt-1 text-lg font-bold">AC–0001</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <dt className="text-sm font-bold text-ink-muted">Medication support</dt>
                  <dd className="mt-1 text-lg font-bold">
                    {allowMedicineChanges ? "Shared management" : "Carer managed"}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="diagnosis-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <h2 id="diagnosis-heading" className="text-2xl font-bold">
                Diagnosis and care needs
              </h2>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="font-bold">Medical conditions and care notes</h3>
                  <p className="mt-2 rounded-xl bg-surface-muted p-4 leading-7 text-ink-soft">
                    {medicalNeeds || "No medical conditions have been recorded."}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold">Disabilities and accessibility needs</h3>
                  <p className="mt-2 rounded-xl bg-surface-muted p-4 leading-7 text-ink-soft">
                    {disabilities || "No accessibility needs have been recorded."}
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="profile-preferences-heading"
              className="rounded-2xl border border-line bg-surface p-6 md:p-7"
            >
              <h2 id="profile-preferences-heading" className="text-2xl font-bold">
                Patient-view preferences
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  `Theme: ${patientTheme.replace("-", " ")}`,
                  `Text size: ${textSize.replace("-", " ")}`,
                  `Read aloud: ${readAloud ? "enabled" : "disabled"}`,
                  `Colour-safe labels: ${colourSafe ? "enabled" : "disabled"}`,
                  `Simplified layout: ${simplifiedLayout ? "enabled" : "disabled"}`,
                  `Reduced motion: ${reducedMotion ? "enabled" : "disabled"}`,
                ].map((preference) => (
                  <li
                    className="flex items-center gap-2 rounded-xl border border-line-strong px-4 py-3 font-bold"
                    key={preference}
                  >
                    <Icon name="check" className="h-4 w-4 text-accent" />
                    {preference}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-7">
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
                    {carerName}
                  </h2>
                  <p className="text-sm text-ink-muted">Primary carer</p>
                </div>
                {!editingCarer && (
                  <button
                    className="min-h-10 rounded-lg px-3 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                    onClick={() => setEditingCarer(true)}
                    type="button"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingCarer ? (
                <div className="mt-6 space-y-4">
                  {[
                    ["Full name", carerName, setCarerName, "text"],
                    ["Phone number", carerPhone, setCarerPhone, "tel"],
                    ["Email address", carerEmail, setCarerEmail, "email"],
                    [
                      "Relationship to patient",
                      carerRelationship,
                      setCarerRelationship,
                      "text",
                    ],
                    ["Availability", carerAvailability, setCarerAvailability, "text"],
                  ].map(([label, value, setter, type]) => (
                    <label className="block" key={label as string}>
                      <span className="mb-1.5 block text-sm font-bold text-ink-muted">
                        {label as string}
                      </span>
                      <input
                        className="min-h-12 w-full rounded-xl border-2 border-line-strong px-3 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                        onChange={(event) =>
                          (setter as (value: string) => void)(event.target.value)
                        }
                        type={type as string}
                        value={value as string}
                      />
                    </label>
                  ))}
                  <button
                    className="min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                    onClick={() => setEditingCarer(false)}
                    type="button"
                  >
                    Save changes
                  </button>
                </div>
              ) : (
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Phone</dt>
                    <dd className="mt-1 font-bold">{carerPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Email</dt>
                    <dd className="mt-1 break-words font-bold">{carerEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Relationship</dt>
                    <dd className="mt-1 font-bold">{carerRelationship}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Access level</dt>
                    <dd className="mt-1 font-bold">Medication and care management</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-ink-muted">Availability</dt>
                    <dd className="mt-1 font-bold">{carerAvailability}</dd>
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
                {consentGiven ? "Consent recorded" : "Consent required"}
              </div>
              {consentGiven ? (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-bold text-ink-muted">How consent was given</dt>
                    <dd className="mt-1">{consentMethod}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink-muted">Date recorded</dt>
                    <dd className="mt-1">{consentDate}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 leading-6 text-danger">
                  Complete the consent section before relying on this care setup.
                </p>
              )}
              <button
                className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => setScreen("setup")}
                type="button"
              >
                {consentGiven ? "Review consent" : "Record consent"}
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
