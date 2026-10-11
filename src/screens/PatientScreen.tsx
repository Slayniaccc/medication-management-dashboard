import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { occurrenceKey } from "../model/doses";
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
  children,
  details,
  goTo,
  hasMedicines,
  markGiven,
  medicationById,
  nextDose,
  nextMedication,
  readAloud,
  setReasonFor,
  setShowAddPrescription,
  todaysDoses,
}: {
  // The dialogs this view can open. They sit inside it so they take its theme
  // and text size.
  children: ReactNode;
  details: Details;
  goTo: (screen: Screen) => void;
  hasMedicines: boolean;
  markGiven: (dose: OccurrenceKey, recordedBy: RecordedBy) => void;
  medicationById: Map<string, Medication>;
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  readAloud: { speaking: boolean; start: () => void; stop: () => void; supported: boolean };
  setReasonFor: (value: { dose: OccurrenceKey; recordedBy: RecordedBy } | null) => void;
  setShowAddPrescription: (show: boolean) => void;
  todaysDoses: Occurrence[];
}) {
  const {
    allowMedicineChanges,
    carerName,
    carerPhone,
    colourSafe,
    patientName,
    patientTheme,
    readAloud: readAloudOn,
    simplifiedLayout,
    textSize,
  } = details;
  const carer = carerName || "your carer";

  const lastLogged = todaysDoses.reduce<DoseEvent | null>(
    (latest, dose) =>
      dose.event && (!latest || dose.event.recordedAt > latest.recordedAt) ? dose.event : latest,
    null,
  );
  const lastLoggedMedication = lastLogged ? medicationById.get(lastLogged.medicationId) : null;

  // Recording a dose replaces the button that was pressed with the next
  // medicine, so focus goes to that heading rather than being dropped.
  const lastKey = lastLogged ? occurrenceKey(lastLogged) + lastLogged.recordedAt : "";
  const previousKey = useRef(lastKey);
  useEffect(() => {
    if (previousKey.current === lastKey) return;
    previousKey.current = lastKey;
    document.getElementById("patient-next-dose")?.focus();
  }, [lastKey]);

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
              className="min-h-12 rounded-xl border-2 border-line-strong px-4 font-bold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => goTo("dashboard")}
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
          Hello{patientName ? `, ${patientName.split(" ")[0]}` : ""}
        </h1>

        {/* Always in the document, so a dose recorded here is announced. */}
        <div role="status">
          {lastLogged && lastLoggedMedication && (
            <p
              className={`mt-8 flex min-h-16 items-center gap-3 rounded-xl border-2 px-5 py-3 text-lg font-bold ${
                lastLogged.outcome === "given"
                  ? "border-given bg-given-subtle text-given"
                  : "border-not-given bg-not-given-subtle text-not-given"
              }`}
            >
              <Icon name={lastLogged.outcome === "given" ? "check" : "close"} />
              {lastLoggedMedication.name}, {formatTime(lastLogged.timeOfDay)}: recorded as{" "}
              {lastLogged.outcome === "given" ? "taken" : "not taken"}
            </p>
          )}
        </div>

        <section
          aria-labelledby="patient-next-dose"
          className="mt-8 rounded-2xl border-2 border-line-strong bg-surface p-6 md:p-8"
        >
          {!hasMedicines ? (
            <>
              <h2
                className="text-3xl font-bold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
                id="patient-next-dose"
                tabIndex={-1}
              >
                No medicines have been added yet
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                When {carer} adds a medicine, the next one to take is shown here.
              </p>
            </>
          ) : !nextDose || !nextMedication ? (
            <h2
              className="text-3xl font-bold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
              id="patient-next-dose"
              tabIndex={-1}
            >
              Every medicine for today is recorded
            </h2>
          ) : (
            <>
              <p className="font-bold uppercase tracking-[0.08em] text-accent">
                Next medicine · {formatTime(nextDose.timeOfDay)}
              </p>
              <h2
                className="mt-3 text-3xl font-bold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
                id="patient-next-dose"
                tabIndex={-1}
              >
                {nextMedication.name}
              </h2>
              <p className="mt-2 text-xl font-bold text-ink-soft">
                {nextMedication.strength} · {nextMedication.form}
              </p>
              {nextMedication.instructions && (
                <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                  {carerName || "Carer"}’s note: {nextMedication.instructions}
                </p>
              )}
              {allowMedicineChanges ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    className="min-h-16 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-on-primary focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                    onClick={() => markGiven(nextDose, "patient")}
                    type="button"
                  >
                    I have taken it
                  </button>
                  <button
                    className="min-h-16 rounded-xl border-2 border-line-strong px-6 py-3 text-lg font-bold text-ink focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onClick={() => setReasonFor({ dose: nextDose, recordedBy: "patient" })}
                    type="button"
                  >
                    I did not take it
                  </button>
                </div>
              ) : (
                <p className="mt-6 rounded-xl border-2 border-line-strong bg-surface-sunken p-5 text-lg leading-relaxed text-ink">
                  {carerName || "Your carer"} records whether each medicine was taken.
                </p>
              )}
            </>
          )}
        </section>

        {todaysDoses.length > 0 && (
          <section
            aria-labelledby="patient-summary"
            className="mt-6 rounded-2xl border-2 border-line bg-surface p-6 simplified:hidden"
          >
            <h2 id="patient-summary" className="text-2xl font-bold">
              All of today’s medicines
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {todaysDoses.map((dose) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-lg"
                  key={occurrenceKey(dose)}
                >
                  <span>
                    <span className="font-bold">{formatTime(dose.timeOfDay)}</span>{" "}
                    {medicationById.get(dose.medicationId)?.name}
                  </span>
                  <span
                    className={`flex items-center gap-2 font-bold ${
                      dose.event === null
                        ? "text-ink-soft"
                        : dose.event.outcome === "given"
                          ? "text-given"
                          : "text-not-given"
                    }`}
                  >
                    {dose.event && (
                      <Icon
                        name={dose.event.outcome === "given" ? "check" : "close"}
                        className="h-5 w-5"
                      />
                    )}
                    {dose.event === null
                      ? "Not recorded yet"
                      : dose.event.outcome === "given"
                        ? "Taken"
                        : "Not taken"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {allowMedicineChanges && (
            <section
              aria-labelledby="patient-add"
              className="rounded-2xl border-2 border-line bg-surface p-6 simplified:hidden"
            >
              <h2 id="patient-add" className="text-2xl font-bold">
                A new medicine
              </h2>
              <p className="mt-2 text-lg leading-relaxed text-ink-soft">
                You can add a prescription yourself, with its name and the times it is due.
              </p>
              <button
                className="mt-5 min-h-14 w-full rounded-xl border-2 border-accent px-5 text-lg font-bold text-accent focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => setShowAddPrescription(true)}
                type="button"
              >
                Add prescription
              </button>
            </section>
          )}

          <section
            aria-labelledby="patient-help"
            className="rounded-2xl border-2 border-line bg-surface p-6"
          >
            <h2 id="patient-help" className="text-2xl font-bold">
              {carerName ? `Talk to ${carerName}` : "Talk to your carer"}
            </h2>
            {carerPhone ? (
              <>
                <p className="mt-2 text-lg leading-relaxed text-ink-soft">
                  {carerName || "Your carer"}’s number is {carerPhone}.
                </p>
                <a
                  className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-lg font-bold text-on-primary focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                  href={`tel:${carerPhone.replace(/[^\d+]/g, "")}`}
                >
                  <Icon name="phone" />
                  Call {carerName || "your carer"}
                </a>
              </>
            ) : (
              <p className="mt-2 text-lg leading-relaxed text-ink-soft">
                No phone number has been added for {carer} yet. It is added on the carer’s own
                details page.
              </p>
            )}
          </section>
        </div>
      </main>

      {children}
    </div>
  );
}
