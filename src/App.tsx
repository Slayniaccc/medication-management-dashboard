import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "./components/Dialog";
import { Icon, type IconName } from "./components/Icon";
import { MedicationImage } from "./components/MedicationImage";
import { Toast } from "./components/Toast";
import { ToggleRow } from "./components/ToggleRow";
import { doseStatus, occurrenceKey, occurrencesOn, recordDose } from "./model/doses";
import { closeSchedule, isInForce } from "./model/schedules";
import {
  isTimeOfDay,
  localDateOf,
  toInstant,
  wallClockDate,
  type LocalDate,
  type TimeOfDay,
} from "./model/time";
import type {
  DoseEvent,
  DoseStatus,
  Medication,
  NotGivenReason,
  OccurrenceKey,
  RecordedBy,
  Schedule,
} from "./model/types";
import type {
  Details,
  PatientTheme,
  Repository,
  Snapshot,
  TextSize,
} from "./storage/repository";

type Screen =
  | "dashboard"
  | "prescriptions"
  | "reminders"
  | "log"
  | "emergency"
  | "profile"
  | "setup"
  | "patient"
  | "settings"
  | "help";

const daysBefore = (at: Date, days: number): LocalDate =>
  localDateOf(new Date(at.getFullYear(), at.getMonth(), at.getDate() - days));

function clockParts(hours: number, minutes: number) {
  return {
    clock: `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    period: hours < 12 ? "AM" : "PM",
  };
}

function timeParts(timeOfDay: TimeOfDay) {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  return clockParts(hours, minutes);
}

function formatTime(timeOfDay: TimeOfDay) {
  const { clock, period } = timeParts(timeOfDay);
  return `${clock} ${period}`;
}

const reminderTimeOptions: TimeOfDay[] = ["08:00", "12:00", "18:00", "21:00"];

const notGivenReasons: NotGivenReason[] = [
  "refused",
  "asleep",
  "unwell",
  "unavailable",
  "withheld-on-clinical-advice",
  "carer-unable",
  "other",
];

// The stored reason is the code. The sentence is built here because it
// contains the patient's name, which can change after the event is recorded.
function reasonLabel(reason: NotGivenReason, patientName: string) {
  const labels: Record<NotGivenReason, string> = {
    refused: `${patientName} refused to take the medicine`,
    asleep: `${patientName} was asleep`,
    unwell: `${patientName} felt unwell`,
    unavailable: "The medicine was unavailable",
    "withheld-on-clinical-advice": "The dose was withheld following clinical advice",
    "carer-unable": "I was unable to administer the medicine",
    other: "Other reason",
  };
  return labels[reason];
}

// A logged dose shows its outcome instead, and a pending one needs no label.
const unloggedStatusLabel: Partial<Record<DoseStatus, string>> = {
  "due-soon": "Due soon",
  overdue: "Overdue",
};

const navItems: Array<{
  label: string;
  icon: IconName;
  target: string;
  active?: boolean;
}> = [
  { label: "Dashboard", icon: "home", target: "dashboard", active: true },
  { label: "Prescriptions", icon: "medication", target: "prescriptions" },
  { label: "Reminders", icon: "calendar", target: "reminders" },
  { label: "Medicine log", icon: "document", target: "log" },
  { label: "Emergency contacts", icon: "phone", target: "emergency" },
  { label: "Patient setup", icon: "settings", target: "patient-setup" },
  { label: "Patient view", icon: "home", target: "patient-view" },
];

const detailsMatch = (a: Details, b: Details) =>
  (Object.keys(a) as Array<keyof Details>).every((field) => a[field] === b[field]);

export default function App({
  initial,
  onSaveFailed,
  repository,
}: {
  initial: Snapshot;
  onSaveFailed: () => void;
  repository: Repository;
}) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [medications, setMedications] = useState(initial.medications);
  const [schedules, setSchedules] = useState(initial.schedules);
  const [events, setEvents] = useState(initial.events);
  const [now, setNow] = useState(() => new Date());
  const [reasonFor, setReasonFor] = useState<{
    dose: OccurrenceKey;
    recordedBy: RecordedBy;
  } | null>(null);
  const [reason, setReason] = useState<NotGivenReason | "">("");
  const [reminderOn, setReminderOn] = useState(initial.details.reminderOn);
  const [toast, setToast] = useState("");
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newDosage, setNewDosage] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newTimes, setNewTimes] = useState([""]);
  const [medicineImage, setMedicineImage] = useState("");
  const [patientName, setPatientName] = useState(initial.details.patientName);
  const [patientAge, setPatientAge] = useState(initial.details.patientAge);
  const [carerName, setCarerName] = useState(initial.details.carerName);
  const [carerPhone, setCarerPhone] = useState(initial.details.carerPhone);
  const [carerEmail, setCarerEmail] = useState(initial.details.carerEmail);
  const [carerRelationship, setCarerRelationship] = useState(initial.details.carerRelationship);
  const [carerAvailability, setCarerAvailability] = useState(initial.details.carerAvailability);
  const [editingCarer, setEditingCarer] = useState(false);
  const [disabilities, setDisabilities] = useState(initial.details.disabilities);
  const [medicalNeeds, setMedicalNeeds] = useState(initial.details.medicalNeeds);
  const [readAloud, setReadAloud] = useState(initial.details.readAloud);
  const [patientTheme, setPatientTheme] = useState<PatientTheme>(initial.details.patientTheme);
  const [textSize, setTextSize] = useState<TextSize>(initial.details.textSize);
  const [colourSafe, setColourSafe] = useState(initial.details.colourSafe);
  const [reducedMotion, setReducedMotion] = useState(initial.details.reducedMotion);
  const [simplifiedLayout, setSimplifiedLayout] = useState(initial.details.simplifiedLayout);
  const [allowMedicineChanges, setAllowMedicineChanges] = useState(
    initial.details.allowMedicineChanges,
  );
  const [consentGiven, setConsentGiven] = useState(initial.details.consentGiven);
  const [consentMethod, setConsentMethod] = useState(initial.details.consentMethod);
  const [consentDate, setConsentDate] = useState(initial.details.consentDate);
  const [emailUpdates, setEmailUpdates] = useState(initial.details.emailUpdates);
  const [soundAlerts, setSoundAlerts] = useState(initial.details.soundAlerts);

  // A write that fails must not pass silently, because the screen already
  // shows the change as made.
  const save = (write: Promise<void>) => {
    write.catch(onSaveFailed);
  };

  // The details are many small fields edited in place, so they are stored as
  // one record whenever any of them differs from what was last stored.
  const details: Details = {
    patientName,
    patientAge,
    disabilities,
    medicalNeeds,
    carerName,
    carerPhone,
    carerEmail,
    carerRelationship,
    carerAvailability,
    consentGiven,
    consentMethod,
    consentDate,
    allowMedicineChanges,
    readAloud,
    patientTheme,
    textSize,
    colourSafe,
    reducedMotion,
    simplifiedLayout,
    reminderOn,
    emailUpdates,
    soundAlerts,
  };
  const storedDetails = useRef(initial.details);
  useEffect(() => {
    if (detailsMatch(storedDetails.current, details)) return;
    storedDetails.current = details;
    save(repository.saveDetails(details));
  });

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduced-motion", reducedMotion);
  }, [reducedMotion]);

  // Due soon and overdue are read off the clock, so the clock has to move.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = localDateOf(now);
  const medicationById = new Map(medications.map((item) => [item.id, item]));
  const todaysDoses = occurrencesOn(today, schedules, events);
  const todaysRows = todaysDoses.flatMap((dose) => {
    const medication = medicationById.get(dose.medicationId);
    return medication ? [{ dose, medication, status: doseStatus(dose, now) }] : [];
  });
  const nextDose = todaysDoses.find((dose) => dose.event === null) ?? null;
  const nextMedication = nextDose ? (medicationById.get(nextDose.medicationId) ?? null) : null;
  const activeSchedules = schedules
    .filter((schedule) => isInForce(schedule, today))
    .sort((a, b) => (a.timeOfDay < b.timeOfDay ? -1 : a.timeOfDay > b.timeOfDay ? 1 : 0));
  // A removed prescription keeps its definition so the log can still name it.
  const activeMedications = medications.filter((item) =>
    activeSchedules.some((schedule) => schedule.medicationId === item.id),
  );
  const reminderTimesFor = (medicationId: string) =>
    activeSchedules
      .filter((schedule) => schedule.medicationId === medicationId)
      .map((schedule) => formatTime(schedule.timeOfDay));
  const dayLabel = (date: LocalDate) =>
    date === today
      ? "Today"
      : date === daysBefore(now, 1)
        ? "Yesterday"
        : wallClockDate(date, "00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });

  const prescriptionIsComplete =
    Boolean(newDosage) &&
    Boolean(newQuantity) &&
    newTimes.length > 0 &&
    newTimes.every(Boolean);
  const carerInitials =
    carerName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CJ";
  const patientInitials =
    patientName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  const markGiven = ({ medicationId, date, timeOfDay }: OccurrenceKey, recordedBy: RecordedBy) => {
    const event: DoseEvent = {
      medicationId,
      date,
      timeOfDay,
      outcome: "given",
      recordedAt: toInstant(new Date()),
      recordedBy,
    };
    setEvents((items) => recordDose(items, event));
    save(repository.recordDose(event));
    setToast("Dose logged as given.");
    window.setTimeout(() => setToast(""), 2800);
  };

  const saveNotGiven = () => {
    if (!reasonFor || !reason) return;
    const { medicationId, date, timeOfDay } = reasonFor.dose;
    const event: DoseEvent = {
      medicationId,
      date,
      timeOfDay,
      outcome: "not-given",
      reason,
      recordedAt: toInstant(new Date()),
      recordedBy: reasonFor.recordedBy,
    };
    setEvents((items) => recordDose(items, event));
    save(repository.recordDose(event));
    setReasonFor(null);
    setReason("");
    setToast("Not-given dose and reason saved.");
    window.setTimeout(() => setToast(""), 2800);
  };

  // Ends the medicine's schedules from today rather than deleting anything, so
  // doses already logged against it keep resolving.
  const removePrescription = (medicationId: string) => {
    const closed = schedules
      .filter((schedule) => schedule.medicationId === medicationId && schedule.endDate === null)
      .reduce(
        (result, schedule) =>
          closeSchedule(
            result,
            schedule.id,
            schedule.startDate > today ? schedule.startDate : today,
          ),
        schedules,
      );
    setSchedules(closed);
    // closeSchedule leaves untouched schedules as the same objects.
    save(repository.saveSchedules(closed.filter((schedule) => !schedules.includes(schedule))));
  };

  const goTo = (target: string) => {
    const screenByTarget: Record<string, Screen> = {
      dashboard: "dashboard",
      prescriptions: "prescriptions",
      reminders: "reminders",
      log: "log",
      emergency: "emergency",
      "patient-profile": "profile",
      "patient-setup": "setup",
      "patient-view": "patient",
    };
    setScreen(screenByTarget[target] ?? "dashboard");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const savePrescription = () => {
    const times = [...new Set(newTimes.filter(isTimeOfDay))];
    if (!newDosage || !newQuantity || times.length === 0) return;
    const medicationId = crypto.randomUUID();
    const added: Schedule[] = times.map((timeOfDay) => ({
      id: crypto.randomUUID(),
      medicationId,
      timeOfDay,
      startDate: today,
      endDate: null,
    }));
    const medication: Medication = {
      id: medicationId,
      name: `Medicine ${medications.length + 1}`,
      purpose: "New prescription",
      strength: newDosage,
      form: newQuantity,
      instructions: "",
      carerNotes: "",
      colour: "indigo",
      imageUrl: medicineImage || undefined,
    };
    setMedications((items) => [...items, medication]);
    setSchedules((items) => [...items, ...added]);
    save(repository.addPrescription(medication, added));
    setShowAddPrescription(false);
    setNewDosage("");
    setNewQuantity("");
    setNewTimes([""]);
    setMedicineImage("");
    setToast("New prescription added.");
    window.setTimeout(() => setToast(""), 2800);
  };

  const readPatientPage = () => {
    if (!("speechSynthesis" in window)) {
      setToast("Read aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const greeting = `Hello ${patientName.split(" ")[0]}.`;
    const message = new SpeechSynthesisUtterance(
      nextDose && nextMedication
        ? `${greeting} Your next medicine is ${nextMedication.name}, ${nextMedication.strength}, ${nextMedication.form}, at ${formatTime(nextDose.timeOfDay)}.`
        : `${greeting} Every medicine for today has been recorded.`,
    );
    message.rate = 0.85;
    window.speechSynthesis.speak(message);
  };

  const isNavActive = (target: string) => {
    const screenByTarget: Record<string, Screen> = {
      dashboard: "dashboard",
      prescriptions: "prescriptions",
      reminders: "reminders",
      log: "log",
      emergency: "emergency",
      "patient-profile": "profile",
      "patient-setup": "setup",
      "patient-view": "patient",
    };
    return screenByTarget[target] === screen;
  };

  const renderCarerPage = (
    eyebrow: string,
    title: string,
    description: string,
    content: ReactNode,
  ) => (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-inverse px-5 py-8 text-on-inverse lg:flex">
          <button
            className="flex items-center gap-4 rounded-xl px-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse"
            onClick={() => goTo("dashboard")}
            type="button"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight text-on-highlight">
              <Icon name="medication" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </button>
          <nav aria-label="Main navigation" className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={isNavActive(item.target) ? "page" : undefined}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse ${
                  isNavActive(item.target)
                    ? "bg-on-inverse text-inverse"
                    : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
                }`}
                key={item.label}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} className="h-6 w-6" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-2 pt-8">
            <button
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-focus-inverse ${
                screen === "help"
                  ? "bg-on-inverse text-inverse"
                  : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
              }`}
              onClick={() => setScreen("help")}
              type="button"
            >
              <Icon name="help" className="h-6 w-6" />
              Help & support
            </button>
            <button
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-focus-inverse ${
                screen === "settings"
                  ? "bg-on-inverse text-inverse"
                  : "text-on-inverse-muted hover:bg-on-inverse/10 hover:text-on-inverse"
              }`}
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
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-bold text-ink">
                {carerInitials}
              </span>
              <span>
                <span className="block font-bold">{carerName}</span>
                <span className="block text-sm text-on-inverse-muted">Carer account</span>
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-line bg-surface lg:hidden">
            <div className="flex min-h-20 items-center justify-between px-5">
              <button
                className="flex items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-focus"
                onClick={() => goTo("dashboard")}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-highlight">
                  <Icon name="medication" />
                </span>
                <span className="font-bold">AccessCare</span>
              </button>
              <button
                aria-label="Open settings"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line-strong focus-visible:outline-3 focus-visible:outline-focus"
                onClick={() => setScreen("settings")}
                type="button"
              >
                <Icon name="settings" />
              </button>
            </div>
            <nav
              aria-label="Mobile navigation"
              className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3"
            >
              {navItems.map((item) => (
                <button
                  aria-current={isNavActive(item.target) ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
                    isNavActive(item.target)
                      ? "bg-primary text-on-primary"
                      : "bg-surface-sunken text-ink"
                  }`}
                  key={item.label}
                  onClick={() => goTo(item.target)}
                  type="button"
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="px-5 py-8 md:px-10 md:py-10 xl:px-14">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-lg leading-7 text-ink-muted">
              {description}
            </p>
            <div className="mt-8">{content}</div>
          </div>
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );

  if (screen === "prescriptions") {
    return renderCarerPage(
      "Medication management",
      "Prescriptions",
      `Manage all ${activeMedications.length} prescriptions for ${patientName}.`,
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => {
              setShowAddPrescription(true);
              setScreen("dashboard");
            }}
            type="button"
          >
            <Icon name="plus" />
            Add prescription
          </button>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {activeMedications.map((medication) => (
            <article
              className="rounded-2xl border border-line bg-surface p-6"
              key={medication.id}
            >
              <div className="flex items-start gap-4">
                <MedicationImage medication={medication} size="large" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{medication.name}</h2>
                  <p className="mt-1 font-bold text-ink-soft">
                    {medication.strength} · {medication.form}
                  </p>
                  <p className="mt-1 text-ink-muted">{medication.purpose}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-muted p-3">
                  <dt className="text-sm font-bold text-ink-muted">Instructions</dt>
                  <dd className="mt-1">{medication.instructions || "None entered"}</dd>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <dt className="text-sm font-bold text-ink-muted">Reminder times</dt>
                  <dd className="mt-1 font-bold">
                    {reminderTimesFor(medication.id).join(", ")}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-3">
                <button
                  className="min-h-11 flex-1 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => {
                    setToast(`${medication.name} selected for editing.`);
                    window.setTimeout(() => setToast(""), 2800);
                  }}
                  type="button"
                >
                  Edit prescription
                </button>
                <button
                  aria-label={`Remove ${medication.name}`}
                  className="min-h-11 rounded-xl border-2 border-danger px-4 text-sm font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => removePrescription(medication.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>,
    );
  }

  if (screen === "reminders") {
    return renderCarerPage(
      "Daily schedule",
      "Reminders",
      `Review and manage every medication reminder for ${patientName}.`,
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="reminder-list-heading" className="space-y-4">
          <h2 id="reminder-list-heading" className="sr-only">
            Scheduled reminders
          </h2>
          {activeSchedules.map((schedule) => {
            const medication = medicationById.get(schedule.medicationId);
            if (!medication) return null;
            return (
              <article
                className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center"
                key={schedule.id}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon name="bell" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold">{formatTime(schedule.timeOfDay)}</p>
                  <p className="mt-1 font-bold">{medication.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {medication.strength} · {medication.form}
                  </p>
                </div>
                <button
                  className="min-h-12 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
                  onClick={() => {
                    setToast(`${medication.name} reminder moved by 10 minutes.`);
                    window.setTimeout(() => setToast(""), 2800);
                  }}
                  type="button"
                >
                  Remind in 10 min
                </button>
              </article>
            );
          })}
        </section>
        <aside className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Reminder controls</h2>
          <div className="mt-4">
            <ToggleRow
              checked={reminderOn}
              description="Send medication reminders to the carer dashboard."
              label="Medication reminders"
              onChange={() => setReminderOn((value) => !value)}
            />
            <ToggleRow
              checked={soundAlerts}
              description="Play a sound with high-priority reminders."
              label="Sound alerts"
              onChange={() => setSoundAlerts((value) => !value)}
            />
          </div>
        </aside>
      </div>,
    );
  }

  if (screen === "log") {
    // Newest first. The occurrence key sorts in scheduled order.
    const loggedDoses = [...events].sort((a, b) =>
      occurrenceKey(a) < occurrenceKey(b) ? 1 : -1,
    );

    return renderCarerPage(
      "Care records",
      "Medicine log",
      "Review given and not-given doses with dates, times, and recorded reasons.",
      <section
        aria-labelledby="full-log-heading"
        className="overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="full-log-heading" className="text-xl font-bold">
            Recent dose activity
          </h2>
          <button
            className="min-h-11 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
            onClick={() => {
              setToast("Medicine log prepared for export.");
              window.setTimeout(() => setToast(""), 2800);
            }}
            type="button"
          >
            Export log
          </button>
        </div>
        {loggedDoses.length === 0 && (
          <p className="p-5 text-ink-muted">
            No doses logged yet. Log a dose from the dashboard and it appears here.
          </p>
        )}
        <ul className="divide-y divide-line">
          {loggedDoses.map((event) => {
            const medication = medicationById.get(event.medicationId);
            const given = event.outcome === "given";
            const loggedAt = new Date(event.recordedAt);
            const loggedOn = localDateOf(loggedAt);
            const loggedTime = clockParts(loggedAt.getHours(), loggedAt.getMinutes());
            return (
              <li
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
                key={occurrenceKey(event)}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    given ? "bg-given-subtle text-given" : "bg-not-given-subtle text-not-given"
                  }`}
                >
                  <Icon name={given ? "check" : "close"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {medication ? `${medication.name} · ${medication.strength}` : "Medicine"}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Scheduled {dayLabel(event.date)}, {formatTime(event.timeOfDay)} · Logged{" "}
                    {loggedOn === event.date ? "" : `${dayLabel(loggedOn)}, `}
                    {loggedTime.clock} {loggedTime.period} by{" "}
                    {event.recordedBy === "carer" ? carerName : patientName}
                  </p>
                  {event.outcome === "not-given" && (
                    <p className="mt-1 text-sm font-bold text-ink-soft">
                      Reason: {reasonLabel(event.reason, patientName)}
                    </p>
                  )}
                  {event.note && (
                    <p className="mt-1 text-sm text-ink-soft">Note: {event.note}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-2 text-sm font-bold ${
                    given ? "bg-given-subtle text-given" : "bg-not-given-subtle text-not-given"
                  }`}
                >
                  {given ? "Given" : "Not given"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>,
    );
  }

  if (screen === "emergency") {
    return renderCarerPage(
      "Urgent support",
      "Emergency contacts",
      "Use these contacts if a dose is missed, duplicated, incorrect, or causes concern.",
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-danger bg-danger-subtle p-6 lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-danger">
            Possible medication error
          </p>
          <h2 className="mt-2 text-2xl font-bold">Do not give another dose</h2>
          <p className="mt-2 max-w-3xl leading-7 text-ink-soft">
            Contact a clinician for advice. If {patientName} is seriously unwell, call
            your local emergency services immediately.
          </p>
        </section>
        {[
          ["On-call doctor", "Incorrect, extra, or missed doses", "Available 24 hours"],
          ["Community nurse", "Medication guidance and care support", "7 AM–10 PM"],
        ].map(([name, purpose, availability]) => (
          <article className="rounded-2xl border border-line bg-surface p-6" key={name}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon name="phone" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <p className="mt-2 text-ink-muted">{purpose}</p>
            <p className="mt-3 text-sm font-bold text-accent">{availability}</p>
            <button
              className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus-on-primary"
              onClick={() => {
                setToast(`Contacting ${name.toLowerCase()}.`);
                window.setTimeout(() => setToast(""), 2800);
              }}
              type="button"
            >
              Call {name.toLowerCase()}
            </button>
          </article>
        ))}
        <button
          className="min-h-14 rounded-xl border-2 border-danger bg-surface px-5 font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-focus lg:col-span-2"
          onClick={() => {
            setToast("Medication incident form opened.");
            window.setTimeout(() => setToast(""), 2800);
          }}
          type="button"
        >
          Record a medication incident
        </button>
      </div>,
    );
  }

  if (screen === "settings") {
    return renderCarerPage(
      "Account controls",
      "Settings",
      "Manage carer notifications and patient accessibility preferences.",
      <div className="grid gap-7 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Carer notifications</h2>
          <div className="mt-4">
            <ToggleRow
              checked={emailUpdates}
              description="Receive a daily summary of doses and care activity."
              label="Daily email summary"
              onChange={() => setEmailUpdates((value) => !value)}
            />
            <ToggleRow
              checked={soundAlerts}
              description="Play a sound for urgent medication notifications."
              label="Sound alerts"
              onChange={() => setSoundAlerts((value) => !value)}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Patient experience</h2>
          <p className="mt-2 leading-6 text-ink-muted">
            Configure theme, text size, read aloud, colour-safe labels, simplified layout,
            and motion preferences.
          </p>
          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-3 focus-visible:outline-focus-on-primary"
            onClick={() => setScreen("setup")}
            type="button"
          >
            Open accessibility preferences
          </button>
        </section>
      </div>,
    );
  }

  if (screen === "help") {
    return renderCarerPage(
      "Support centre",
      "Help & support",
      "Get help using AccessCare or contact the care team.",
      <div className="grid gap-5 md:grid-cols-2">
        {[
          ["Medication help", "Get support with prescriptions, reminders, and dose logs."],
          ["Accessibility help", "Get help adapting the patient experience."],
          ["Account help", "Get support with consent, profiles, and permissions."],
          ["Contact support", "Speak to the AccessCare support team."],
        ].map(([title, description], index) => (
          <button
            className="rounded-2xl border border-line bg-surface p-6 text-left hover:border-accent hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-focus"
            key={title}
            onClick={() => {
              if (index === 0) {
                setScreen("prescriptions");
              } else if (index === 1) {
                setScreen("setup");
              } else if (index === 2) {
                setScreen("profile");
              } else {
                setToast("Support request started.");
                window.setTimeout(() => setToast(""), 2800);
              }
            }}
            type="button"
          >
            <Icon name={index === 3 ? "phone" : "help"} className="h-7 w-7 text-accent" />
            <span className="mt-4 block text-xl font-bold">{title}</span>
            <span className="mt-2 block leading-6 text-ink-muted">{description}</span>
          </button>
        ))}
      </div>,
    );
  }

  if (screen === "profile") {
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

  if (screen === "setup") {
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
                <p className="text-sm text-ink-muted">Carer workspace</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="hidden min-h-11 items-center gap-2 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex"
                onClick={() => setScreen("patient")}
                type="button"
              >
                <Icon name="home" className="h-4 w-4" />
                Preview patient view
              </button>
              <button
                className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                onClick={() => setScreen("dashboard")}
                type="button"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-accent">
              Patient setup
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Adapt AccessCare to the patient
            </h1>
            <p className="mt-3 text-lg leading-7 text-ink-muted">
              Record the patient’s needs, choose accessibility support, and decide which
              medication actions they can manage independently.
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
                  <div>
                    <p className="text-sm font-bold text-accent">Step 1</p>
                    <h2 id="patient-details-heading" className="text-xl font-bold">
                      Patient details and needs
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <label className="block">
                    <span className="mb-2 block font-bold">Patient name</span>
                    <input
                      className="min-h-12 w-full rounded-xl border-2 border-line-strong px-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                      onChange={(event) => setPatientName(event.target.value)}
                      type="text"
                      value={patientName}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">Patient age</span>
                    <input
                      className="min-h-12 w-full rounded-xl border-2 border-line-strong px-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                      inputMode="numeric"
                      min="0"
                      onChange={(event) => setPatientAge(event.target.value)}
                      type="number"
                      value={patientAge}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">
                      Disabilities or accessibility needs
                    </span>
                    <span className="mb-2 block text-sm text-ink-muted">
                      Describe vision, hearing, mobility, memory, learning, or communication
                      needs.
                    </span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border-2 border-line-strong p-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                      onChange={(event) => setDisabilities(event.target.value)}
                      value={disabilities}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">Medical conditions or care notes</span>
                    <span className="mb-2 block text-sm text-ink-muted">
                      Only include information the care team needs to provide safe support.
                    </span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border-2 border-line-strong p-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
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
                <p className="text-sm font-bold text-accent">Step 3</p>
                <h2 id="permissions-heading" className="mt-1 text-xl font-bold">
                  Patient access and permissions
                </h2>
                <p className="mt-2 text-base leading-6 text-ink-muted">
                  Choose what {patientName || "the patient"} can change. The carer can
                  change this at any time.
                </p>
                <div className="mt-4">
                  <ToggleRow
                    checked={allowMedicineChanges}
                    description="Allows the patient to record taken or not taken, add medicines, and change prescription details."
                    label="Allow patient to manage and record medicines"
                    onChange={() => setAllowMedicineChanges((value) => !value)}
                  />
                </div>
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                    allowMedicineChanges
                      ? "bg-accent-subtle text-accent"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {allowMedicineChanges
                    ? "Patient medicine management and dose reporting are enabled."
                    : "View only. The carer must manage medicines and record every dose."}
                </div>
              </section>

              <section
                aria-labelledby="consent-heading"
                className="rounded-2xl border-2 border-danger bg-surface p-6 md:p-7"
              >
                <p className="text-sm font-bold text-danger">Step 4 · Required</p>
                <h2 id="consent-heading" className="mt-1 text-xl font-bold">
                  Patient consent
                </h2>
                <p className="mt-2 leading-6 text-ink-muted">
                  Ask {patientName || "the patient"} to review this statement. Explain it
                  in an accessible format and give them an opportunity to ask questions.
                </p>

                <blockquote className="mt-5 rounded-xl border-l-4 border-accent bg-surface-muted p-4 leading-7 text-ink">
                  “I, {patientName || "the patient"}, consent to {carerName} supporting
                  and managing my medicines, reminders, dose records, accessibility
                  preferences, and care contacts in AccessCare. I understand what access
                  my carer will have, and that I can ask to change or withdraw my consent.”
                </blockquote>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-bold">How consent was given</span>
                    <select
                      className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                      onChange={(event) => setConsentMethod(event.target.value)}
                      value={consentMethod}
                    >
                      <option>Confirmed directly by patient</option>
                      <option>Written consent</option>
                      <option>Verbal consent with witness</option>
                      <option>Authorised representative</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">Date consent recorded</span>
                    <input
                      className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base outline-none focus:border-accent focus:ring-3 focus:ring-accent-line"
                      onChange={(event) => setConsentDate(event.target.value)}
                      type="date"
                      value={consentDate}
                    />
                  </label>
                </div>

                <label
                  className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                    consentGiven
                      ? "border-accent bg-accent-subtle"
                      : "border-line-strong bg-surface"
                  }`}
                >
                  <input
                    checked={consentGiven}
                    className="mt-0.5 h-6 w-6 shrink-0 accent-accent"
                    onChange={(event) => setConsentGiven(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-bold">
                      I confirm that {patientName || "the patient"} gave informed consent
                      for this care arrangement.
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-ink-muted">
                      Consent was freely given after the access and responsibilities were
                      explained in a way the patient could understand.
                    </span>
                  </span>
                </label>
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
                <div>
                  <p className="text-sm font-bold text-accent">Step 2</p>
                  <h2 id="accessibility-heading" className="text-xl font-bold">
                    Accessibility preferences
                  </h2>
                </div>
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
                      className={`min-h-14 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                        patientTheme === value
                          ? "border-accent bg-accent-subtle text-ink"
                          : "border-line-strong bg-surface text-ink-muted"
                      }`}
                      key={value}
                      onClick={() => setPatientTheme(value)}
                      type="button"
                    >
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
                      className={`min-h-14 rounded-xl border-2 px-2 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                        textSize === value
                          ? "border-accent bg-accent-subtle text-ink"
                          : "border-line-strong bg-surface text-ink-muted"
                      } ${value === "standard" ? "text-sm" : value === "large" ? "text-base" : "text-lg"}`}
                      key={value}
                      onClick={() => setTextSize(value)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-7">
                <ToggleRow
                  checked={readAloud}
                  description="Shows a control that reads medication instructions out loud."
                  label="Read aloud"
                  onChange={() => setReadAloud((value) => !value)}
                />
                <ToggleRow
                  checked={colourSafe}
                  description="Uses icons and written labels so meaning never depends on colour alone."
                  label="Colour-safe status indicators"
                  onChange={() => setColourSafe((value) => !value)}
                />
                <ToggleRow
                  checked={simplifiedLayout}
                  description="Reduces secondary information and keeps one clear action per section."
                  label="Simplified patient layout"
                  onChange={() => setSimplifiedLayout((value) => !value)}
                />
                <ToggleRow
                  checked={reducedMotion}
                  description="Removes non-essential transitions and animated movement."
                  label="Reduce motion"
                  onChange={() => setReducedMotion((value) => !value)}
                />
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col justify-end gap-3 rounded-2xl bg-inverse p-5 sm:flex-row">
            <button
              className="min-h-12 rounded-xl border-2 border-on-inverse px-5 text-sm font-bold text-on-inverse hover:bg-on-inverse/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse"
              onClick={() => setScreen("patient")}
              type="button"
            >
              Preview patient view
            </button>
            <button
              className="min-h-12 rounded-xl bg-highlight px-6 text-sm font-bold text-on-highlight enabled:hover:bg-on-inverse disabled:cursor-not-allowed disabled:bg-disabled disabled:text-ink-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-on-inverse"
              disabled={!consentGiven || !consentDate}
              onClick={() => {
                setToast("Patient setup saved.");
                setScreen("dashboard");
                window.setTimeout(() => setToast(""), 2800);
              }}
              type="button"
            >
              {consentGiven ? "Save patient setup" : "Consent required to save"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "patient") {
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
              {readAloud && (
                <button
                  className="min-h-12 rounded-xl border-2 border-accent px-4 font-bold text-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  onClick={readPatientPage}
                  type="button"
                >
                  Read page aloud
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

        <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
          <p className="font-bold text-accent">Today’s medicines</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
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

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-inverse px-5 py-8 text-on-inverse lg:flex">
          <div className="flex items-center gap-4 px-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight text-on-highlight">
              <Icon name="medication" className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </div>

          <nav aria-label="Main navigation" className="mt-10 space-y-2">
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
          </nav>

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
        </aside>

        <main className="min-w-0 flex-1">
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
            aria-label="Mobile navigation"
            className="flex gap-2 overflow-x-auto border-b border-line bg-surface px-4 py-3 lg:hidden"
          >
            {navItems.map((item) => (
              <button
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-surface-sunken px-4 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-focus"
                key={item.label}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-surface-sunken px-4 text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-focus"
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-4 w-4" />
              Settings
            </button>
          </nav>

          <div className="px-5 py-8 md:px-10 md:py-10 xl:px-14">
            <section
              className="scroll-mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
              id="dashboard"
            >
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-accent">
                  {patientName}’s care plan · fictional medicines
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-focus"
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
                      className="min-h-10 rounded-lg px-2 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-focus"
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
          </div>
        </main>
      </div>

      {showAddPrescription && (
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
      )}

      {reasonFor !== null && (
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
            <fieldset className="mt-6 space-y-3">
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
                    name="missed-reason"
                    onChange={() => setReason(option)}
                    type="radio"
                    value={option}
                  />
                  {reasonLabel(option, patientName)}
                </label>
              ))}
            </fieldset>
            <div className="mt-7 flex gap-3">
              <button
                className="min-h-12 flex-1 rounded-xl border border-line-strong px-4 text-sm font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => setReasonFor(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
                disabled={!reason}
                onClick={saveNotGiven}
                type="button"
              >
                Save to care log
              </button>
            </div>
        </Dialog>
      )}

      <Toast message={toast} />
    </div>
  );
}
