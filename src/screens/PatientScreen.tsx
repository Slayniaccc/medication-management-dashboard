import { Icon } from "../components/Icon";
import type {
  DoseEvent,
  Medication,
  Occurrence,
  OccurrenceKey,
  RecordedBy,
} from "../model/types";
import type { Details } from "../storage/repository";
import { formatTime } from "./format";
import { mainId, viewHeadingId, type Screen } from "./navigation";

export function PatientScreen({
  activeMedications,
  details,
  goTo,
  markGiven,
  medicationById,
  nextDose,
  nextMedication,
  readAloud,
  setReasonFor,
  setScreen,
  setShowAddPrescription,
  todaysDoses,
}: {
  activeMedications: Medication[];
  details: Details;
  goTo: (target: string) => void;
  markGiven: (dose: OccurrenceKey, recordedBy: RecordedBy) => void;
  medicationById: Map<string, Medication>;
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  readAloud: { speaking: boolean; start: () => void; stop: () => void; supported: boolean };
  setReasonFor: (value: { dose: OccurrenceKey; recordedBy: RecordedBy } | null) => void;
  setScreen: (screen: Screen) => void;
  setShowAddPrescription: (show: boolean) => void;
  todaysDoses: Occurrence[];
}) {
  const {
    allowMedicineChanges,
    carerName,
    colourSafe,
    patientName,
    patientTheme,
    readAloud: readAloudOn,
    reducedMotion,
    simplifiedLayout,
    textSize,
  } = details;

  const lastLogged = todaysDoses.reduce<DoseEvent | null>(
    (latest, dose) =>
      dose.event && (!latest || dose.event.recordedAt > latest.recordedAt) ? dose.event : latest,
    null,
  );
  const lastLoggedMedication = lastLogged ? medicationById.get(lastLogged.medicationId) : null;

  return (
    <div
      className="min-h-screen bg-page text-base text-ink"
      data-colour-safe={colourSafe ? "" : undefined}
      data-simplified-layout={simplifiedLayout ? "" : undefined}
      data-text-size={textSize}
      data-theme={patientTheme}
    >
      <header className="border-b-2 border-line-strong bg-surface">
        <div className="mx-auto flex min-h-20 max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Icon name="medication" />
            </div>
            <div>
              <p className="font-bold">AccessCare</p>
              <p className="text-sm text-ink-soft">Patient view</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Only when the carer has turned it on, and never speaking unasked:
                a voice nobody started would talk over a screen reader. */}
            {readAloudOn && readAloud.supported && (
              <button
                className="min-h-12 rounded-xl border-2 border-accent px-4 font-bold text-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={readAloud.speaking ? readAloud.stop : readAloud.start}
                type="button"
              >
                {readAloud.speaking ? "Stop reading" : "Read next medicine aloud"}
              </button>
            )}
            <button
              className="min-h-12 rounded-xl bg-highlight px-4 font-bold text-on-highlight focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => setScreen("dashboard")}
              type="button"
            >
              Carer dashboard
            </button>
          </div>
        </div>
      </header>

      <main
        className="mx-auto max-w-5xl px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-8 md:py-12"
        id={mainId}
        tabIndex={-1}
      >
        <p className="font-bold text-accent">Today’s medicines</p>
        <h1
          className="mt-2 text-4xl font-bold tracking-tight focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-5xl"
          id={viewHeadingId}
          tabIndex={-1}
        >
          Hello, {patientName.split(" ")[0] || "there"}
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Here is what you need to do next. Ask your carer if you are unsure.
        </p>

        {lastLogged && lastLoggedMedication && (
          <div
            className={`mt-8 flex min-h-16 items-center gap-3 rounded-xl border-2 px-5 py-3 text-lg font-bold ${
              lastLogged.outcome === "given"
                ? "border-given bg-given-subtle text-given"
                : "border-not-given bg-not-given-subtle text-not-given"
            }`}
            role="status"
          >
            <Icon name={lastLogged.outcome === "given" ? "check" : "close"} />
            {lastLoggedMedication.name}, {formatTime(lastLogged.timeOfDay)}: recorded as{" "}
            {lastLogged.outcome === "given" ? "taken" : "not taken"}
          </div>
        )}

        <section
          aria-labelledby="patient-next-dose"
          className="mt-8 rounded-2xl border-2 border-line bg-surface p-6 md:p-8"
        >
          {!nextDose || !nextMedication ? (
            <h2 id="patient-next-dose" className="text-3xl font-bold">
              Every medicine for today is recorded
            </h2>
          ) : (
            <>
              <p className="font-bold uppercase tracking-[0.08em] text-accent">
                Next medicine · {formatTime(nextDose.timeOfDay)}
              </p>
              <h2 id="patient-next-dose" className="mt-3 text-3xl font-bold">
                {nextMedication.name}
              </h2>
              <p className="mt-2 text-xl font-bold text-ink-soft">
                {nextMedication.strength} · {nextMedication.form}
              </p>
              {nextMedication.instructions && (
                <p className="mt-4 leading-relaxed text-ink-soft">
                  {carerName}’s note: {nextMedication.instructions}
                </p>
              )}
            </>
          )}
          {!nextDose ? null : !allowMedicineChanges ? (
            <div className="mt-6 rounded-xl border-2 border-line-strong bg-surface-sunken p-5 text-ink">
              <p className="font-bold">Dose reporting is managed by your carer</p>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                You can view this medicine, but only {carerName} can record whether it
                was taken or not taken.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="min-h-16 rounded-xl bg-primary px-6 text-lg font-bold text-on-primary focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => markGiven(nextDose, "patient")}
                type="button"
              >
                I have taken this medicine
              </button>
              <button
                className="min-h-16 rounded-xl border-2 border-not-given px-6 text-lg font-bold text-not-given focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => {
                  setScreen("dashboard");
                  setReasonFor({ dose: nextDose, recordedBy: "patient" });
                }}
                type="button"
              >
                I did not take it
              </button>
            </div>
          )}
        </section>

        <section
          className="mt-6 rounded-2xl border-2 border-line bg-surface p-6 simplified:hidden"
          aria-labelledby="patient-summary"
        >
          <h2 id="patient-summary" className="text-2xl font-bold">
            Your medicine summary
          </h2>
          <p className="mt-2 text-ink-soft">
            You have {activeMedications.length} medicines scheduled today
            {nextDose
              ? ` and your next reminder is at ${formatTime(nextDose.timeOfDay)}.`
              : " and every dose is recorded."}
          </p>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section
            aria-labelledby="patient-permissions"
            className="rounded-2xl border-2 border-line bg-surface p-6"
          >
            <h2 id="patient-permissions" className="text-2xl font-bold">
              My medicines
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {allowMedicineChanges
                ? "You can record doses, add a new medicine, or ask your carer for help."
                : "Your carer manages prescription changes and records doses. You can view your medicine schedule."}
            </p>
            {allowMedicineChanges ? (
              <button
                className="mt-5 min-h-14 w-full rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => {
                  setShowAddPrescription(true);
                  setScreen("dashboard");
                }}
                type="button"
              >
                Add a medicine
              </button>
            ) : (
              <div className="mt-5 rounded-xl bg-surface-sunken px-4 py-3 font-bold text-ink-soft">
                Medicine changes are managed by your carer.
              </div>
            )}
          </section>

          <section
            aria-labelledby="patient-help"
            className="rounded-2xl border-2 border-line bg-surface p-6"
          >
            <h2 id="patient-help" className="text-2xl font-bold">
              Need help?
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Tell your carer if you feel unwell or think you took the wrong dose.
            </p>
            <button
              className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-danger px-5 font-bold text-on-danger focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => {
                setScreen("dashboard");
                window.setTimeout(() => goTo("emergency"), 0);
              }}
              type="button"
            >
              <Icon name="phone" />
              Contact my carer
            </button>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {colourSafe && (
            <span className="rounded-full border-2 border-accent px-3 py-2 text-sm font-bold text-accent">
              Icons and labels enabled
            </span>
          )}
          {reducedMotion && (
            <span className="rounded-full border-2 border-accent px-3 py-2 text-sm font-bold text-accent">
              Reduced motion
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
