import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Icon } from "../components/Icon";
import { MedicationImage } from "../components/MedicationImage";
import { Toast } from "../components/Toast";
import { doseStatus, occurrenceKey } from "../model/doses";
import type {
  DoseStatus,
  Medication,
  Occurrence,
  OccurrenceKey,
  RecordedBy,
} from "../model/types";
import type { Details } from "../storage/repository";
import type { CarerPageShell } from "./CarerPage";
import { formatTime, timeParts } from "./format";
import { mainId, navItems, viewHeadingId } from "./navigation";

// A logged dose shows its outcome instead, and a pending one needs no label.
const unloggedStatusLabel: Partial<Record<DoseStatus, string>> = {
  "due-soon": "Due soon",
  overdue: "Overdue",
};

export function DashboardScreen({
  activeMedications,
  children,
  details,
  markGiven,
  nextDose,
  nextMedication,
  now,
  reminderTimesFor,
  setReasonFor,
  setReminderOn,
  setShowAddPrescription,
  setToast,
  shell,
  todaysRows,
}: {
  activeMedications: Medication[];
  // The dialogs, which are only ever open over the dashboard.
  children: ReactNode;
  details: Details;
  markGiven: (dose: OccurrenceKey, recordedBy: RecordedBy) => void;
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  now: Date;
  reminderTimesFor: (medicationId: string) => string[];
  setReasonFor: (value: { dose: OccurrenceKey; recordedBy: RecordedBy } | null) => void;
  setReminderOn: Dispatch<SetStateAction<boolean>>;
  setShowAddPrescription: (show: boolean) => void;
  setToast: (message: string) => void;
  shell: CarerPageShell;
  todaysRows: Array<{ dose: Occurrence; medication: Medication; status: DoseStatus }>;
}) {
  const { carerName, patientName, reminderOn } = details;
  const { carerInitials, goTo, isNavActive, setScreen, toast } = shell;

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <nav
          aria-label="Main"
          className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-inverse px-5 py-8 text-on-inverse lg:flex"
        >
          <div className="flex items-center gap-4 px-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight text-on-highlight">
              <Icon name="medication" className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </div>

          <div className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={isNavActive(item.target) ? "page" : undefined}
                key={item.label}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse ${
                  isNavActive(item.target)
                    ? "bg-on-inverse text-inverse"
                    : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
                }`}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-2">
            <button
              className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse focus-visible:outline-3 focus-visible:outline-focus-inverse"
              onClick={() => setScreen("help")}
              type="button"
            >
              <Icon name="help" className="h-6 w-6" />
              Help & support
            </button>
            <button
              className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse focus-visible:outline-3 focus-visible:outline-focus-inverse"
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-6 w-6" />
              Settings
            </button>
            <button
              className="mt-5 flex w-full items-center gap-3 border-t border-on-inverse/15 px-3 pt-6 text-left focus-visible:outline-3 focus-visible:outline-focus-inverse"
              onClick={() => setScreen("profile")}
              type="button"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-bold text-ink">
                {carerInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{carerName}</p>
                <p className="truncate text-sm text-on-inverse-muted">Carer account</p>
              </div>
            </button>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between border-b border-line bg-page/90 px-5 backdrop-blur md:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-highlight">
                <Icon name="medication" />
              </div>
              <span className="hidden font-bold sm:block">AccessCare</span>
            </div>
            <p className="hidden text-sm font-semibold text-ink-muted lg:block">
              Monday, June 16
            </p>
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label={reminderOn ? "Turn reminders off" : "Turn reminders on"}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  reminderOn
                    ? "border-accent-line bg-accent-subtle text-accent"
                    : "border-line-strong bg-surface text-ink-muted"
                }`}
                onClick={() => setReminderOn((value) => !value)}
                type="button"
              >
                <Icon name="bell" className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Reminders {reminderOn ? "on" : "off"}
                </span>
              </button>
              <button
                aria-label="View notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => {
                  setToast("No new urgent notifications.");
                  window.setTimeout(() => setToast(""), 2800);
                }}
                type="button"
              >
                <Icon name="bell" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-attention ring-2 ring-surface" />
              </button>
            </div>
          </header>

          <nav
            aria-label="Main"
            className="flex flex-wrap gap-2 border-b border-line bg-surface px-4 py-3 lg:hidden"
          >
            {navItems.map((item) => (
              <button
                className="flex min-h-11 items-center gap-2 rounded-xl bg-surface-sunken px-4 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-focus"
                key={item.label}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              className="flex min-h-11 items-center gap-2 rounded-xl bg-surface-sunken px-4 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-focus"
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-4 w-4" />
              Settings
            </button>
          </nav>

          <main
            className="px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-10 md:py-10 xl:px-14"
            id={mainId}
            tabIndex={-1}
          >
            <section
              className="scroll-mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
              id="dashboard"
            >
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-accent">
                  {patientName}’s care plan · fictional medicines
                </p>
                <h1
                  className="text-3xl font-bold tracking-tight text-ink focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-4xl"
                  id={viewHeadingId}
                  tabIndex={-1}
                >
                  Good morning, {carerName.split(" ")[0] || "Carer"}
                </h1>
                <p className="mt-2 text-base text-ink-muted">
                  {patientName} has {activeMedications.length} prescriptions scheduled today.
                </p>
              </div>
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => setShowAddPrescription(true)}
                type="button"
              >
                <Icon name="plus" />
                Add prescription
              </button>
            </section>

            <section
              aria-labelledby="next-dose-heading"
              className="mt-8 overflow-hidden rounded-2xl bg-accent-soft"
              id="next-reminder"
            >
              <div className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center md:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-accent shadow-sm">
                    <Icon name="bell" className="h-6 w-6" />
                  </div>
                  {nextDose && nextMedication ? (
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
                        Next reminder ·{" "}
                        {unloggedStatusLabel[doseStatus(nextDose, now)] ??
                          formatTime(nextDose.timeOfDay)}
                      </p>
                      <h2 id="next-dose-heading" className="mt-1 text-xl font-bold">
                        {nextMedication.name}, {nextMedication.strength}
                      </h2>
                      <p className="mt-1 text-base font-medium text-ink-soft">
                        {formatTime(nextDose.timeOfDay)} · {nextMedication.form}
                      </p>
                    </div>
                  ) : (
                    <h2 id="next-dose-heading" className="mt-2 text-xl font-bold">
                      Every dose for today is logged
                    </h2>
                  )}
                </div>
                {nextDose && (
                  <button
                    className="min-h-11 rounded-xl border-2 border-accent bg-transparent px-5 text-sm font-bold text-accent hover:bg-surface/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onClick={() => {
                      setToast("Reminder moved by 10 minutes.");
                      window.setTimeout(() => setToast(""), 2800);
                    }}
                    type="button"
                  >
                    Remind me in 10 min
                  </button>
                )}
              </div>
            </section>

            <div className="mt-8">
              <section
                aria-labelledby="schedule-heading"
                className="scroll-mt-6"
                id="prescriptions"
              >
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 id="schedule-heading" className="text-2xl font-bold">
                      Today’s prescriptions
                    </h2>
                    <p className="mt-1 text-base text-ink-muted">
                      Record whether each dose was “Given” or “Not given.”
                    </p>
                  </div>
                  <button
                    className="hidden min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus sm:flex"
                    onClick={() => setShowAddPrescription(true)}
                    type="button"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Add prescription
                  </button>
                </div>

                <div className="space-y-4">
                  {todaysRows.map(({ dose, medication, status }) => (
                    <article
                      key={occurrenceKey(dose)}
                      className={`rounded-2xl border bg-surface p-5 shadow-xs transition md:p-6 ${
                        status === "given"
                          ? "border-given"
                          : status === "not-given"
                            ? "border-not-given"
                            : "border-line"
                      }`}
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <MedicationImage className="mt-1" medication={medication} size="small" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold">{medication.name}</h3>
                              <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-sm font-semibold text-ink-muted">
                                {medication.purpose}
                              </span>
                            </div>
                            <p className="mt-1 font-bold text-ink-soft">
                              {medication.strength} · {medication.form}
                            </p>
                            {medication.instructions && (
                              <p className="mt-1 text-base text-ink-muted">
                                {medication.instructions}
                              </p>
                            )}
                            {reminderTimesFor(medication.id).length > 1 && (
                              <p className="mt-2 text-sm font-bold text-accent">
                                {reminderTimesFor(medication.id).length} daily reminders:{" "}
                                {reminderTimesFor(medication.id).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-t border-line pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                          <div className="w-20 text-center">
                            <p className="text-xl font-bold">{timeParts(dose.timeOfDay).clock}</p>
                            <p className="text-sm font-bold text-ink-muted">
                              {timeParts(dose.timeOfDay).period}
                            </p>
                            {unloggedStatusLabel[status] && (
                              <p
                                className={`mt-1 rounded-full px-1 py-0.5 text-sm font-bold ${
                                  status === "overdue"
                                    ? "bg-highlight text-on-highlight"
                                    : "bg-accent-subtle text-accent"
                                }`}
                              >
                                {unloggedStatusLabel[status]}
                              </p>
                            )}
                          </div>
                          {dose.event === null ? (
                            <div className="flex flex-1 gap-2 md:flex-none">
                              <button
                                aria-label={`Mark the ${formatTime(dose.timeOfDay)} dose of ${medication.name} as given to ${patientName}`}
                                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary md:flex-none"
                                onClick={() => markGiven(dose, "carer")}
                                type="button"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-on-primary">
                                  <Icon name="check" className="h-3 w-3" />
                                </span>
                                Given
                              </button>
                              <button
                                aria-label={`Mark the ${formatTime(dose.timeOfDay)} dose of ${medication.name} as not given to ${patientName}`}
                                className="min-h-12 rounded-xl border border-line-strong px-3 text-sm font-bold text-ink-muted hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                onClick={() => setReasonFor({ dose, recordedBy: "carer" })}
                                type="button"
                              >
                                Not given
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${
                                status === "given"
                                  ? "bg-given-subtle text-given"
                                  : "bg-not-given-subtle text-not-given"
                              }`}
                            >
                              <Icon
                                name={status === "given" ? "check" : "close"}
                                className="h-4 w-4"
                              />
                              {status === "given" ? "Given" : "Not given"}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="hidden">
                <section
                  aria-labelledby="progress-heading"
                  className="rounded-2xl border border-line bg-surface p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 id="progress-heading" className="text-lg font-bold">
                      This week
                    </h2>
                    <button
                      aria-label="More adherence options"
                      className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-focus"
                      type="button"
                    >
                      <Icon name="more" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold tracking-tight">92%</p>
                      <p className="mt-1 text-base text-ink-muted">Doses given on time</p>
                    </div>
                    <span className="rounded-full bg-accent-subtle px-3 py-1.5 text-sm font-bold text-accent">
                      +4% this week
                    </span>
                  </div>
                  <div className="mt-7 grid grid-cols-7 gap-2">
                    {[
                      ["M", true],
                      ["T", true],
                      ["W", true],
                      ["T", false],
                      ["F", true],
                      ["S", true],
                      ["S", true],
                    ].map(([day, complete], index) => (
                      <div className="text-center" key={`${day}-${index}`}>
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                            complete
                              ? "bg-given text-surface"
                              : "bg-not-given-subtle text-not-given"
                          }`}
                        >
                          <Icon
                            name={complete ? "check" : "close"}
                            className="h-4 w-4"
                          />
                        </div>
                        <p className="mt-2 text-sm font-bold text-ink-muted">{day}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  aria-labelledby="log-heading"
                  className="rounded-2xl border border-line bg-surface p-6"
                  id="medicine-log"
                >
                  <div className="flex items-center justify-between">
                    <h2 id="log-heading" className="text-lg font-bold">
                      Medicine log
                    </h2>
                    <button
                      className="min-h-11 rounded-lg px-2 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                      type="button"
                    >
                      View all
                    </button>
                  </div>
                  <ul className="mt-3 divide-y divide-line">
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-given-subtle text-given">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 1 · 10 mg
                        </p>
                        <p className="text-sm text-ink-muted">Yesterday, 8:04 AM</p>
                      </div>
                      <span className="text-sm font-bold text-given">Given</span>
                    </li>
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-given-subtle text-given">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 2 · 500 mg
                        </p>
                        <p className="text-sm text-ink-muted">Yesterday, 8:32 AM</p>
                      </div>
                      <span className="text-sm font-bold text-given">Given</span>
                    </li>
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-not-given-subtle text-not-given">
                        <Icon name="close" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 3 · 1,000 IU
                        </p>
                        <p className="text-sm text-ink-muted">
                          Sun, 1:00 PM · {patientName} refused
                        </p>
                      </div>
                      <span className="text-sm font-bold text-not-given">Not given</span>
                    </li>
                  </ul>
                </section>

                <section
                  aria-labelledby="emergency-heading"
                  className="scroll-mt-6 overflow-hidden rounded-2xl border-2 border-danger bg-surface"
                  id="emergency-contacts"
                >
                  <div className="bg-danger-subtle p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-on-danger">
                        <Icon name="phone" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-danger">
                          Medication error support
                        </p>
                        <h2 id="emergency-heading" className="mt-1 text-xl font-bold">
                          Possible missed or incorrect dose?
                        </h2>
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-6 text-ink-soft">
                      Do not give another dose until you have received clinical advice.
                      Contact {patientName}’s doctor or nurse now.
                    </p>
                    <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm font-bold text-danger">
                      If {patientName} is seriously unwell, call your local emergency
                      services immediately.
                    </p>
                  </div>

                  <div className="divide-y divide-line p-2">
                    <div className="p-3">
                      <p className="text-base font-bold">On-call doctor</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        For incorrect, extra, or missed doses · Available 24 hours
                      </p>
                      <button
                        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                        onClick={() => {
                          setToast("Contacting the on-call doctor.");
                          window.setTimeout(() => setToast(""), 2800);
                        }}
                        type="button"
                      >
                        <Icon name="phone" className="h-4 w-4" />
                        Call on-call doctor
                      </button>
                    </div>

                    <div className="p-3">
                      <p className="text-base font-bold">Community nurse</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        For medication guidance and care support · 7 AM–10 PM
                      </p>
                      <button
                        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-accent bg-surface px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        onClick={() => {
                          setToast("Contacting the community nurse.");
                          window.setTimeout(() => setToast(""), 2800);
                        }}
                        type="button"
                      >
                        <Icon name="phone" className="h-4 w-4" />
                        Call community nurse
                      </button>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {children}

      <Toast message={toast} />
    </div>
  );
}

