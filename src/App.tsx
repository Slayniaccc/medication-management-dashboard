import { useEffect, useState, type ReactNode } from "react";

type DoseStatus = "pending" | "taken" | "missed";
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
type PatientTheme = "light" | "high-contrast" | "dark";
type TextSize = "standard" | "large" | "extra-large";

type Medication = {
  id: number;
  name: string;
  purpose: string;
  dosage: string;
  instructions: string;
  time: string;
  period: string;
  color: string;
  imageUrl?: string;
  reminderTimes?: string[];
  status: DoseStatus;
};

type IconProps = {
  name:
    | "home"
    | "medication"
    | "calendar"
    | "document"
    | "settings"
    | "bell"
    | "plus"
    | "clock"
    | "check"
    | "chevron"
    | "more"
    | "help"
    | "image"
    | "phone"
    | "user"
    | "close";
  className?: string;
};

function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const paths: Record<IconProps["name"], ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    medication: (
      <>
        <path d="M10.5 5.5 18.5 13a4 4 0 0 1-5.5 5.8L5 11.3a4 4 0 0 1 5.5-5.8Z" />
        <path d="m8.7 14.8 5.6-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h9l3 3v15H6Z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3.3 2c-.8.4-1.1.9-1.1 2M12 17h.01" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m4 17 5-4 3 3 3-3 5 4" />
      </>
    ),
    phone: (
      <path d="M5.4 3.5 8.7 3l1.6 4.2-2.1 1.6a15.8 15.8 0 0 0 7 7l1.6-2.1 4.2 1.6-.5 3.3c-.2 1.1-1.1 1.9-2.2 1.9C10.1 20.5 3.5 13.9 3.5 5.7c0-1.1.8-2 1.9-2.2Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const initialMedications: Medication[] = [
  {
    id: 1,
    name: "Medicine 1",
    purpose: "Blood pressure",
    dosage: "10 mg · 1 tablet",
    instructions: "Take with a full glass of water",
    time: "8:00",
    period: "AM",
    color: "bg-[#E27064]",
    status: "pending",
  },
  {
    id: 2,
    name: "Medicine 2",
    purpose: "Blood sugar",
    dosage: "500 mg · 1 tablet",
    instructions: "Take with breakfast",
    time: "8:30",
    period: "AM",
    color: "bg-[#41998E]",
    status: "pending",
  },
  {
    id: 3,
    name: "Medicine 3",
    purpose: "Daily supplement",
    dosage: "1,000 IU · 1 capsule",
    instructions: "Take with food",
    time: "1:00",
    period: "PM",
    color: "bg-[#936315]",
    status: "pending",
  },
];

const navItems: Array<{
  label: string;
  icon: IconProps["name"];
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

function ToggleRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#DDE2DE] py-4 last:border-0">
      <div>
        <p className="font-bold text-[#172E35]">{label}</p>
        <p className="mt-1 text-sm leading-5 text-[#526267]">{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "on" : "off"}`}
        className={`relative h-8 w-14 shrink-0 rounded-full border-2 transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42] ${
          checked
            ? "border-[#276D64] bg-[#276D64]"
            : "border-[#71827D] bg-[#EEF1EE]"
        }`}
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [medications, setMedications] = useState(initialMedications);
  const [reasonFor, setReasonFor] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reminderOn, setReminderOn] = useState(true);
  const [toast, setToast] = useState("");
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newDosage, setNewDosage] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newTimes, setNewTimes] = useState([""]);
  const [medicineImage, setMedicineImage] = useState("");
  const [patientName, setPatientName] = useState("Asha");
  const [patientAge, setPatientAge] = useState("63");
  const [carerName, setCarerName] = useState("Meera");
  const [carerPhone, setCarerPhone] = useState("07123 456 789");
  const [carerEmail, setCarerEmail] = useState("meera@example.com");
  const [carerRelationship, setCarerRelationship] = useState("Family carer");
  const [carerAvailability, setCarerAvailability] = useState(
    "Primary daytime contact",
  );
  const [editingCarer, setEditingCarer] = useState(false);
  const [disabilities, setDisabilities] = useState(
    "Reduced vision and difficulty distinguishing some colours",
  );
  const [medicalNeeds, setMedicalNeeds] = useState(
    "Blood pressure monitoring and blood sugar support",
  );
  const [readAloud, setReadAloud] = useState(true);
  const [patientTheme, setPatientTheme] = useState<PatientTheme>("high-contrast");
  const [textSize, setTextSize] = useState<TextSize>("large");
  const [colourSafe, setColourSafe] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [simplifiedLayout, setSimplifiedLayout] = useState(true);
  const [allowMedicineChanges, setAllowMedicineChanges] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentMethod, setConsentMethod] = useState("Confirmed directly by patient");
  const [consentDate, setConsentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = patientTheme;
    root.dataset.textSize = textSize;
    root.dataset.colourSafe = String(colourSafe);
    root.dataset.reducedMotion = String(reducedMotion);
    root.dataset.simplifiedLayout = String(simplifiedLayout);
  }, [patientTheme, textSize, colourSafe, reducedMotion, simplifiedLayout]);

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

  const markTaken = (id: number) => {
    setMedications((items) =>
      items.map((item) => (item.id === id ? { ...item, status: "taken" } : item)),
    );
    setToast("Dose logged as given.");
    window.setTimeout(() => setToast(""), 2800);
  };

  const saveMissed = () => {
    if (!reasonFor || !reason) return;
    setMedications((items) =>
      items.map((item) => (item.id === reasonFor ? { ...item, status: "missed" } : item)),
    );
    setReasonFor(null);
    setReason("");
    setToast("Not-given dose and reason saved.");
    window.setTimeout(() => setToast(""), 2800);
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
    const reminderTimes = newTimes.filter(Boolean);
    if (!newDosage || !newQuantity || reminderTimes.length === 0) return;
    const [time, period = "AM"] = reminderTimes[0].split(" ");
    setMedications((items) => [
      ...items,
      {
        id: Date.now(),
        name: `Medicine ${items.length + 1}`,
        purpose: "New prescription",
        dosage: `${newDosage} · ${newQuantity}`,
        instructions: "Follow the prescription instructions",
        time,
        period,
        color: "bg-[#6D7DB3]",
        imageUrl: medicineImage || undefined,
        reminderTimes,
        status: "pending",
      },
    ]);
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
    const message = new SpeechSynthesisUtterance(
      `Hello ${patientName.split(" ")[0]}. Your next medicine is Medicine 2, 500 milligrams, at 8:30 AM. Take one tablet with breakfast.`,
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
    <div className="min-h-screen bg-[#F7F6F1] text-[#172E35]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-[#173B42] px-5 py-8 text-white lg:flex">
          <button
            className="flex items-center gap-4 rounded-xl px-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F8CF73]"
            onClick={() => goTo("dashboard")}
            type="button"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8CF73] text-[#173B42]">
              <Icon name="medication" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </button>
          <nav aria-label="Main navigation" className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={isNavActive(item.target) ? "page" : undefined}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F8CF73] ${
                  isNavActive(item.target)
                    ? "bg-white text-[#173B42]"
                    : "text-[#C9D7D8] hover:bg-white/10 hover:text-white"
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
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-[#F8CF73] ${
                screen === "help"
                  ? "bg-white text-[#173B42]"
                  : "text-[#C9D7D8] hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setScreen("help")}
              type="button"
            >
              <Icon name="help" className="h-6 w-6" />
              Help & support
            </button>
            <button
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold focus-visible:outline-3 focus-visible:outline-[#F8CF73] ${
                screen === "settings"
                  ? "bg-white text-[#173B42]"
                  : "text-[#C9D7D8] hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-6 w-6" />
              Settings
            </button>
            <button
              className="mt-5 flex w-full items-center gap-3 border-t border-white/15 px-3 pt-6 text-left focus-visible:outline-3 focus-visible:outline-[#F8CF73]"
              onClick={() => setScreen("profile")}
              type="button"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#CFE2DC] font-bold text-[#173B42]">
                {carerInitials}
              </span>
              <span>
                <span className="block font-bold">{carerName}</span>
                <span className="block text-sm text-[#C9D7D8]">Carer account</span>
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-[#DDE2DE] bg-white lg:hidden">
            <div className="flex min-h-20 items-center justify-between px-5">
              <button
                className="flex items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-[#173B42]"
                onClick={() => goTo("dashboard")}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B42] text-[#F8CF73]">
                  <Icon name="medication" />
                </span>
                <span className="font-bold">AccessCare</span>
              </button>
              <button
                aria-label="Open settings"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#71827D] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                onClick={() => setScreen("settings")}
                type="button"
              >
                <Icon name="settings" />
              </button>
            </div>
            <nav
              aria-label="Mobile navigation"
              className="flex gap-2 overflow-x-auto border-t border-[#DDE2DE] px-4 py-3"
            >
              {navItems.map((item) => (
                <button
                  aria-current={isNavActive(item.target) ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
                    isNavActive(item.target)
                      ? "bg-[#173B42] text-white"
                      : "bg-[#EEF1EE] text-[#173B42]"
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
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#276D64]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-lg leading-7 text-[#526267]">
              {description}
            </p>
            <div className="mt-8">{content}</div>
          </div>
        </main>
      </div>
      {toast && (
        <div
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-xl bg-[#173B42] px-5 text-sm font-bold text-white shadow-xl"
          role="status"
        >
          <Icon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );

  if (screen === "prescriptions") {
    return renderCarerPage(
      "Medication management",
      "Prescriptions",
      `Manage all ${medications.length} prescriptions for ${patientName}.`,
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#173B42] px-5 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
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
          {medications.map((medication) => (
            <article
              className="rounded-2xl border border-[#DDE2DE] bg-white p-6"
              key={medication.id}
            >
              <div className="flex items-start gap-4">
                {medication.imageUrl ? (
                  <img
                    alt={`${medication.name} packaging`}
                    className="h-16 w-16 rounded-xl border border-[#71827D] object-cover"
                    src={medication.imageUrl}
                  />
                ) : (
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${medication.color} text-white`}
                  >
                    <Icon name="medication" className="h-7 w-7" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{medication.name}</h2>
                  <p className="mt-1 font-bold text-[#3E555A]">{medication.dosage}</p>
                  <p className="mt-1 text-[#526267]">{medication.purpose}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F7F8F6] p-3">
                  <dt className="text-sm font-bold text-[#526267]">Instructions</dt>
                  <dd className="mt-1">{medication.instructions}</dd>
                </div>
                <div className="rounded-xl bg-[#F7F8F6] p-3">
                  <dt className="text-sm font-bold text-[#526267]">Reminder times</dt>
                  <dd className="mt-1 font-bold">
                    {medication.reminderTimes?.join(", ") ??
                      `${medication.time} ${medication.period}`}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-3">
                <button
                  className="min-h-11 flex-1 rounded-xl border-2 border-[#276D64] px-4 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
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
                  className="min-h-11 rounded-xl border-2 border-[#913C34] px-4 text-sm font-bold text-[#913C34] hover:bg-[#FAECE9] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                  onClick={() =>
                    setMedications((items) =>
                      items.filter((item) => item.id !== medication.id),
                    )
                  }
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
          {medications.map((medication, index) => (
            <article
              className="flex flex-col gap-5 rounded-2xl border border-[#DDE2DE] bg-white p-5 sm:flex-row sm:items-center"
              key={medication.id}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEDE7] text-[#276D64]">
                <Icon name="bell" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">
                  {medication.time} {medication.period}
                </p>
                <p className="mt-1 font-bold">{medication.name}</p>
                <p className="mt-1 text-sm text-[#526267]">{medication.dosage}</p>
              </div>
              <button
                className="min-h-12 rounded-xl border-2 border-[#276D64] px-4 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                onClick={() => {
                  setToast(
                    `${medication.name} reminder moved ${index === 0 ? "to 8:10 AM" : "by 10 minutes"}.`,
                  );
                  window.setTimeout(() => setToast(""), 2800);
                }}
                type="button"
              >
                Remind in 10 min
              </button>
            </article>
          ))}
        </section>
        <aside className="rounded-2xl border border-[#DDE2DE] bg-white p-6">
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
    return renderCarerPage(
      "Care records",
      "Medicine log",
      "Review given and not-given doses with dates, times, and recorded reasons.",
      <section
        aria-labelledby="full-log-heading"
        className="overflow-hidden rounded-2xl border border-[#DDE2DE] bg-white"
      >
        <div className="flex flex-col gap-3 border-b border-[#DDE2DE] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="full-log-heading" className="text-xl font-bold">
            Recent dose activity
          </h2>
          <button
            className="min-h-11 rounded-xl border-2 border-[#276D64] px-4 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
            onClick={() => {
              setToast("Medicine log prepared for export.");
              window.setTimeout(() => setToast(""), 2800);
            }}
            type="button"
          >
            Export log
          </button>
        </div>
        <ul className="divide-y divide-[#DDE2DE]">
          {[
            ["Medicine 1", "10 mg", "Given", "Today, 8:04 AM", ""],
            ["Medicine 2", "500 mg", "Given", "Yesterday, 8:32 AM", ""],
            [
              "Medicine 3",
              "1,000 IU",
              "Not given",
              "Sunday, 1:00 PM",
              `${patientName} refused`,
            ],
            ["Medicine 1", "10 mg", "Given", "Sunday, 8:02 AM", ""],
          ].map(([name, dose, status, date, note], index) => (
            <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center" key={index}>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  status === "Given"
                    ? "bg-[#E8F3EF] text-[#276D64]"
                    : "bg-[#FAECE9] text-[#913C34]"
                }`}
              >
                <Icon name={status === "Given" ? "check" : "close"} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {name} · {dose}
                </p>
                <p className="mt-1 text-sm text-[#526267]">
                  {date}
                  {note && ` · ${note}`}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-2 text-sm font-bold ${
                  status === "Given"
                    ? "bg-[#E8F3EF] text-[#276D64]"
                    : "bg-[#FAECE9] text-[#913C34]"
                }`}
              >
                {status}
              </span>
            </li>
          ))}
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
        <section className="rounded-2xl border-2 border-[#B45248] bg-[#FAECE9] p-6 lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#913C34]">
            Possible medication error
          </p>
          <h2 className="mt-2 text-2xl font-bold">Do not give another dose</h2>
          <p className="mt-2 max-w-3xl leading-7 text-[#3E555A]">
            Contact a clinician for advice. If {patientName} is seriously unwell, call
            your local emergency services immediately.
          </p>
        </section>
        {[
          ["On-call doctor", "Incorrect, extra, or missed doses", "Available 24 hours"],
          ["Community nurse", "Medication guidance and care support", "7 AM–10 PM"],
        ].map(([name, purpose, availability]) => (
          <article className="rounded-2xl border border-[#DDE2DE] bg-white p-6" key={name}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DDEDE7] text-[#276D64]">
              <Icon name="phone" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <p className="mt-2 text-[#526267]">{purpose}</p>
            <p className="mt-3 text-sm font-bold text-[#276D64]">{availability}</p>
            <button
              className="mt-5 min-h-12 w-full rounded-xl bg-[#173B42] px-5 font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-[#E27064]"
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
          className="min-h-14 rounded-xl border-2 border-[#913C34] bg-white px-5 font-bold text-[#913C34] hover:bg-[#FAECE9] focus-visible:outline-3 focus-visible:outline-[#173B42] lg:col-span-2"
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
        <section className="rounded-2xl border border-[#DDE2DE] bg-white p-6">
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
        <section className="rounded-2xl border border-[#DDE2DE] bg-white p-6">
          <h2 className="text-xl font-bold">Patient experience</h2>
          <p className="mt-2 leading-6 text-[#526267]">
            Configure theme, text size, read aloud, colour-safe labels, simplified layout,
            and motion preferences.
          </p>
          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-[#173B42] px-5 font-bold text-white focus-visible:outline-3 focus-visible:outline-[#E27064]"
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
            className="rounded-2xl border border-[#DDE2DE] bg-white p-6 text-left hover:border-[#276D64] hover:bg-[#F7F8F6] focus-visible:outline-3 focus-visible:outline-[#173B42]"
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
            <Icon name={index === 3 ? "phone" : "help"} className="h-7 w-7 text-[#276D64]" />
            <span className="mt-4 block text-xl font-bold">{title}</span>
            <span className="mt-2 block leading-6 text-[#526267]">{description}</span>
          </button>
        ))}
      </div>,
    );
  }

  if (screen === "profile") {
    return (
      <div className="min-h-screen bg-[#F7F6F1] text-[#172E35]">
        <header className="border-b border-[#DDE2DE] bg-white">
          <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B42] text-[#F8CF73]">
                <Icon name="medication" />
              </div>
              <div>
                <p className="font-bold">AccessCare</p>
                <p className="text-sm text-[#526267]">Care profile</p>
              </div>
            </div>
            <button
              className="min-h-11 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
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
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#276D64]">
                My account
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {carerName}
              </h1>
              <p className="mt-2 text-lg text-[#526267]">
                Manage your carer details and review the patient’s care information.
              </p>
            </div>
            <button
              className="min-h-12 rounded-xl border-2 border-[#276D64] px-5 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
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
                className="rounded-2xl border border-[#DDE2DE] bg-white p-6 md:p-7"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DDEDE7] text-2xl font-bold text-[#173B42]">
                    {patientInitials}
                  </div>
                  <div>
                    <h2 id="patient-profile-heading" className="text-2xl font-bold">
                      Patient information
                    </h2>
                    <p className="mt-1 text-[#526267]">Primary patient receiving care</p>
                  </div>
                </div>
                <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#F7F8F6] p-4">
                    <dt className="text-sm font-bold text-[#526267]">Full name</dt>
                    <dd className="mt-1 text-lg font-bold">{patientName}</dd>
                  </div>
                  <div className="rounded-xl bg-[#F7F8F6] p-4">
                    <dt className="text-sm font-bold text-[#526267]">Age</dt>
                    <dd className="mt-1 text-lg font-bold">{patientAge}</dd>
                  </div>
                  <div className="rounded-xl bg-[#F7F8F6] p-4">
                    <dt className="text-sm font-bold text-[#526267]">Patient reference</dt>
                    <dd className="mt-1 text-lg font-bold">AC–0001</dd>
                  </div>
                  <div className="rounded-xl bg-[#F7F8F6] p-4">
                    <dt className="text-sm font-bold text-[#526267]">Medication support</dt>
                    <dd className="mt-1 text-lg font-bold">
                      {allowMedicineChanges ? "Shared management" : "Carer managed"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="diagnosis-heading"
                className="rounded-2xl border border-[#DDE2DE] bg-white p-6 md:p-7"
              >
                <h2 id="diagnosis-heading" className="text-2xl font-bold">
                  Diagnosis and care needs
                </h2>
                <div className="mt-5 space-y-5">
                  <div>
                    <h3 className="font-bold">Medical conditions and care notes</h3>
                    <p className="mt-2 rounded-xl bg-[#F7F8F6] p-4 leading-7 text-[#3E555A]">
                      {medicalNeeds || "No medical conditions have been recorded."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold">Disabilities and accessibility needs</h3>
                    <p className="mt-2 rounded-xl bg-[#F7F8F6] p-4 leading-7 text-[#3E555A]">
                      {disabilities || "No accessibility needs have been recorded."}
                    </p>
                  </div>
                </div>
              </section>

              <section
                aria-labelledby="profile-preferences-heading"
                className="rounded-2xl border border-[#DDE2DE] bg-white p-6 md:p-7"
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
                      className="flex items-center gap-2 rounded-xl border border-[#71827D] px-4 py-3 font-bold"
                      key={preference}
                    >
                      <Icon name="check" className="h-4 w-4 text-[#276D64]" />
                      {preference}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="space-y-7">
              <section
                aria-labelledby="carer-profile-heading"
                className="rounded-2xl border-2 border-[#276D64] bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173B42] font-bold text-white">
                    {carerInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 id="carer-profile-heading" className="text-xl font-bold">
                      {carerName}
                    </h2>
                    <p className="text-sm text-[#526267]">Primary carer</p>
                  </div>
                  {!editingCarer && (
                    <button
                      className="min-h-10 rounded-lg px-3 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
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
                        <span className="mb-1.5 block text-sm font-bold text-[#526267]">
                          {label as string}
                        </span>
                        <input
                          className="min-h-12 w-full rounded-xl border-2 border-[#71827D] px-3 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                          onChange={(event) =>
                            (setter as (value: string) => void)(event.target.value)
                          }
                          type={type as string}
                          value={value as string}
                        />
                      </label>
                    ))}
                    <button
                      className="min-h-12 w-full rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                      onClick={() => setEditingCarer(false)}
                      type="button"
                    >
                      Save changes
                    </button>
                  </div>
                ) : (
                  <dl className="mt-6 space-y-4">
                    <div>
                      <dt className="text-sm font-bold text-[#526267]">Phone</dt>
                      <dd className="mt-1 font-bold">{carerPhone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-bold text-[#526267]">Email</dt>
                      <dd className="mt-1 break-words font-bold">{carerEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-bold text-[#526267]">Relationship</dt>
                      <dd className="mt-1 font-bold">{carerRelationship}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-bold text-[#526267]">Access level</dt>
                      <dd className="mt-1 font-bold">Medication and care management</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-bold text-[#526267]">Availability</dt>
                      <dd className="mt-1 font-bold">{carerAvailability}</dd>
                    </div>
                  </dl>
                )}
              </section>

              <section
                aria-labelledby="consent-profile-heading"
                className={`rounded-2xl border-2 p-6 ${
                  consentGiven
                    ? "border-[#276D64] bg-[#E8F3EF]"
                    : "border-[#B45248] bg-[#FAECE9]"
                }`}
              >
                <h2 id="consent-profile-heading" className="text-xl font-bold">
                  Consent record
                </h2>
                <div className="mt-4 flex items-center gap-2 font-bold">
                  <Icon
                    name={consentGiven ? "check" : "close"}
                    className={`h-5 w-5 ${
                      consentGiven ? "text-[#276D64]" : "text-[#913C34]"
                    }`}
                  />
                  {consentGiven ? "Consent recorded" : "Consent required"}
                </div>
                {consentGiven ? (
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-bold text-[#526267]">How consent was given</dt>
                      <dd className="mt-1">{consentMethod}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-[#526267]">Date recorded</dt>
                      <dd className="mt-1">{consentDate}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 leading-6 text-[#913C34]">
                    Complete the consent section before relying on this care setup.
                  </p>
                )}
                <button
                  className="mt-5 min-h-12 w-full rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
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
      <div className="min-h-screen bg-[#F7F6F1] text-[#172E35]">
        <header className="border-b border-[#DDE2DE] bg-white">
          <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B42] text-[#F8CF73]">
                <Icon name="medication" />
              </div>
              <div>
                <p className="font-bold">AccessCare</p>
                <p className="text-sm text-[#526267]">Carer workspace</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="hidden min-h-11 items-center gap-2 rounded-xl border-2 border-[#276D64] px-4 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42] sm:flex"
                onClick={() => setScreen("patient")}
                type="button"
              >
                <Icon name="home" className="h-4 w-4" />
                Preview patient view
              </button>
              <button
                className="min-h-11 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
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
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#276D64]">
              Patient setup
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Adapt AccessCare to the patient
            </h1>
            <p className="mt-3 text-lg leading-7 text-[#526267]">
              Record the patient’s needs, choose accessibility support, and decide which
              medication actions they can manage independently.
            </p>
          </div>

          <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="space-y-7">
              <section
                aria-labelledby="patient-details-heading"
                className="rounded-2xl border border-[#DDE2DE] bg-white p-6 md:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDEDE7] text-[#276D64]">
                    <Icon name="home" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#276D64]">Step 1</p>
                    <h2 id="patient-details-heading" className="text-xl font-bold">
                      Patient details and needs
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <label className="block">
                    <span className="mb-2 block font-bold">Patient name</span>
                    <input
                      className="min-h-12 w-full rounded-xl border-2 border-[#71827D] px-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                      onChange={(event) => setPatientName(event.target.value)}
                      type="text"
                      value={patientName}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">Patient age</span>
                    <input
                      className="min-h-12 w-full rounded-xl border-2 border-[#71827D] px-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
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
                    <span className="mb-2 block text-sm text-[#526267]">
                      Describe vision, hearing, mobility, memory, learning, or communication
                      needs.
                    </span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border-2 border-[#71827D] p-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                      onChange={(event) => setDisabilities(event.target.value)}
                      value={disabilities}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-bold">Medical conditions or care notes</span>
                    <span className="mb-2 block text-sm text-[#526267]">
                      Only include information the care team needs to provide safe support.
                    </span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border-2 border-[#71827D] p-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                      onChange={(event) => setMedicalNeeds(event.target.value)}
                      value={medicalNeeds}
                    />
                  </label>
                </div>
              </section>

              <section
                aria-labelledby="permissions-heading"
                className="rounded-2xl border-2 border-[#276D64] bg-white p-6 md:p-7"
              >
                <p className="text-sm font-bold text-[#276D64]">Step 3</p>
                <h2 id="permissions-heading" className="mt-1 text-xl font-bold">
                  Patient access and permissions
                </h2>
                <p className="mt-2 text-base leading-6 text-[#526267]">
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
                      ? "bg-[#E8F3EF] text-[#276D64]"
                      : "bg-[#FAECE9] text-[#913C34]"
                  }`}
                >
                  {allowMedicineChanges
                    ? "Patient medicine management and dose reporting are enabled."
                    : "View only. The carer must manage medicines and record every dose."}
                </div>
              </section>

              <section
                aria-labelledby="consent-heading"
                className="rounded-2xl border-2 border-[#B45248] bg-white p-6 md:p-7"
              >
                <p className="text-sm font-bold text-[#913C34]">Step 4 · Required</p>
                <h2 id="consent-heading" className="mt-1 text-xl font-bold">
                  Patient consent
                </h2>
                <p className="mt-2 leading-6 text-[#526267]">
                  Ask {patientName || "the patient"} to review this statement. Explain it
                  in an accessible format and give them an opportunity to ask questions.
                </p>

                <blockquote className="mt-5 rounded-xl border-l-4 border-[#276D64] bg-[#F7F8F6] p-4 leading-7 text-[#172E35]">
                  “I, {patientName || "the patient"}, consent to {carerName} supporting
                  and managing my medicines, reminders, dose records, accessibility
                  preferences, and care contacts in AccessCare. I understand what access
                  my carer will have, and that I can ask to change or withdraw my consent.”
                </blockquote>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-bold">How consent was given</span>
                    <select
                      className="min-h-12 w-full rounded-xl border-2 border-[#71827D] bg-white px-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
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
                      className="min-h-12 w-full rounded-xl border-2 border-[#71827D] bg-white px-4 text-base outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                      onChange={(event) => setConsentDate(event.target.value)}
                      type="date"
                      value={consentDate}
                    />
                  </label>
                </div>

                <label
                  className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                    consentGiven
                      ? "border-[#276D64] bg-[#E8F3EF]"
                      : "border-[#71827D] bg-white"
                  }`}
                >
                  <input
                    checked={consentGiven}
                    className="mt-0.5 h-6 w-6 shrink-0 accent-[#276D64]"
                    onChange={(event) => setConsentGiven(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-bold">
                      I confirm that {patientName || "the patient"} gave informed consent
                      for this care arrangement.
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[#526267]">
                      Consent was freely given after the access and responsibilities were
                      explained in a way the patient could understand.
                    </span>
                  </span>
                </label>
              </section>
            </div>

            <section
              aria-labelledby="accessibility-heading"
              className="rounded-2xl border border-[#DDE2DE] bg-white p-6 md:p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDEDE7] text-[#276D64]">
                  <Icon name="settings" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#276D64]">Step 2</p>
                  <h2 id="accessibility-heading" className="text-xl font-bold">
                    Accessibility preferences
                  </h2>
                </div>
              </div>

              <fieldset className="mt-7">
                <legend className="font-bold">Theme and contrast</legend>
                <p className="mt-1 text-sm text-[#526267]">
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
                      className={`min-h-14 rounded-xl border-2 px-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42] ${
                        patientTheme === value
                          ? "border-[#276D64] bg-[#E8F3EF] text-[#173B42]"
                          : "border-[#71827D] bg-white text-[#526267]"
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
                <p className="mt-1 text-sm text-[#526267]">
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
                      className={`min-h-14 rounded-xl border-2 px-2 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42] ${
                        textSize === value
                          ? "border-[#276D64] bg-[#E8F3EF] text-[#173B42]"
                          : "border-[#71827D] bg-white text-[#526267]"
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

          <div className="mt-8 flex flex-col justify-end gap-3 rounded-2xl bg-[#173B42] p-5 sm:flex-row">
            <button
              className="min-h-12 rounded-xl border-2 border-white px-5 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F8CF73]"
              onClick={() => setScreen("patient")}
              type="button"
            >
              Preview patient view
            </button>
            <button
              className="min-h-12 rounded-xl bg-[#F8CF73] px-6 text-sm font-bold text-[#173B42] enabled:hover:bg-white disabled:cursor-not-allowed disabled:bg-[#C9D0CE] disabled:text-[#526267] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
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
    const isDark = patientTheme === "dark";
    const isHighContrast = patientTheme === "high-contrast";
    const pageClass = isDark
      ? "bg-[#102C33] text-white"
      : isHighContrast
        ? "bg-white text-[#0B1E23]"
        : "bg-[#F7F6F1] text-[#172E35]";
    const cardClass = isDark
      ? "border-[#AFC1C3] bg-[#173B42]"
      : isHighContrast
        ? "border-[#172E35] bg-white"
        : "border-[#DDE2DE] bg-white";
    const secondaryClass = isDark ? "text-[#D5E0DE]" : "text-[#3E555A]";
    const sizeClass =
      textSize === "extra-large"
        ? "[&_p]:!text-xl [&_p]:!leading-relaxed [&_span]:!text-xl [&_button]:!text-xl [&_h1]:!text-5xl md:[&_h1]:!text-6xl [&_h2]:!text-4xl"
        : textSize === "large"
          ? "[&_p]:!text-lg [&_p]:!leading-relaxed [&_span]:!text-lg [&_button]:!text-lg"
          : "text-base";
    const patientDoseWasTaken =
      medications.find((medication) => medication.id === 2)?.status === "taken";

    return (
      <div
        className={`min-h-screen ${pageClass} ${sizeClass} ${
          reducedMotion ? "[&_*]:transition-none" : ""
        }`}
      >
        <header
          className={`border-b-2 ${isDark ? "border-[#AFC1C3] bg-[#173B42]" : "border-[#172E35] bg-white"}`}
        >
          <div className="mx-auto flex min-h-20 max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isDark ? "bg-[#F8CF73] text-[#173B42]" : "bg-[#173B42] text-[#F8CF73]"
                }`}
              >
                <Icon name="medication" />
              </div>
              <div>
                <p className="font-bold">AccessCare</p>
                <p className={`text-sm ${secondaryClass}`}>Patient view</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {readAloud && (
                <button
                  className={`min-h-12 rounded-xl border-2 px-4 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 ${
                    isDark
                      ? "border-white text-white focus-visible:outline-[#F8CF73]"
                      : "border-[#276D64] text-[#276D64] focus-visible:outline-[#173B42]"
                  }`}
                  onClick={readPatientPage}
                  type="button"
                >
                  Read page aloud
                </button>
              )}
              <button
                className="min-h-12 rounded-xl bg-[#F8CF73] px-4 font-bold text-[#173B42] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                onClick={() => setScreen("dashboard")}
                type="button"
              >
                Carer dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
          <p className={`font-bold ${isDark ? "text-[#F8CF73]" : "text-[#276D64]"}`}>
            Today’s medicines
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Hello, {patientName.split(" ")[0] || "there"}
          </h1>
          <p className={`mt-3 leading-7 ${secondaryClass}`}>
            Here is what you need to do next. Ask your carer if you are unsure.
          </p>

          <section
            aria-labelledby="patient-next-dose"
            className={`mt-8 rounded-2xl border-2 p-6 md:p-8 ${cardClass}`}
          >
            <p
              className={`font-bold uppercase tracking-[0.08em] ${
                isDark ? "text-[#F8CF73]" : "text-[#276D64]"
              }`}
            >
              Next medicine · 8:30 AM
            </p>
            <h2 id="patient-next-dose" className="mt-3 text-3xl font-bold">
              Medicine 2
            </h2>
            <p className={`mt-2 text-xl font-bold ${secondaryClass}`}>
              500 mg · 1 tablet
            </p>
            <p className={`mt-4 leading-7 ${secondaryClass}`}>
              Take with breakfast and a full glass of water.
            </p>
            {patientDoseWasTaken ? (
              <div
                className={`mt-6 flex min-h-16 items-center justify-center gap-3 rounded-xl border-2 px-5 text-lg font-bold ${
                  isDark
                    ? "border-white bg-white text-[#173B42]"
                    : "border-[#276D64] bg-[#E8F3EF] text-[#276D64]"
                }`}
                role="status"
              >
                <Icon name="check" />
                Recorded as taken
              </div>
            ) : !allowMedicineChanges ? (
              <div
                className={`mt-6 rounded-xl border-2 p-5 ${
                  isDark
                    ? "border-[#F8CF73] bg-[#102C33] text-white"
                    : "border-[#71827D] bg-[#EEF1EE] text-[#172E35]"
                }`}
              >
                <p className="font-bold">Dose reporting is managed by your carer</p>
                <p className={`mt-2 text-base leading-6 ${secondaryClass}`}>
                  You can view this medicine, but only {carerName} can record whether it
                  was taken or not taken.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  className={`min-h-16 rounded-xl px-6 text-lg font-bold focus-visible:outline-4 focus-visible:outline-offset-2 ${
                    isDark
                      ? "bg-[#F8CF73] text-[#173B42] focus-visible:outline-white"
                      : "bg-[#173B42] text-white focus-visible:outline-[#E27064]"
                  }`}
                  onClick={() => markTaken(2)}
                  type="button"
                >
                  I have taken this medicine
                </button>
                <button
                  className={`min-h-16 rounded-xl border-2 px-6 text-lg font-bold focus-visible:outline-4 focus-visible:outline-offset-2 ${
                    isDark
                      ? "border-white text-white focus-visible:outline-[#F8CF73]"
                      : "border-[#913C34] text-[#913C34] focus-visible:outline-[#173B42]"
                  }`}
                  onClick={() => {
                    setScreen("dashboard");
                    setReasonFor(2);
                  }}
                  type="button"
                >
                  I did not take it
                </button>
              </div>
            )}
          </section>

          {!simplifiedLayout && (
            <section
              className={`mt-6 rounded-2xl border-2 p-6 ${cardClass}`}
              aria-labelledby="patient-summary"
            >
              <h2 id="patient-summary" className="text-2xl font-bold">
                Your medicine summary
              </h2>
              <p className={`mt-2 ${secondaryClass}`}>
                You have {medications.length} medicines scheduled today and your next
                reminder is at 8:30 AM.
              </p>
            </section>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section
              aria-labelledby="patient-permissions"
              className={`rounded-2xl border-2 p-6 ${cardClass}`}
            >
              <h2 id="patient-permissions" className="text-2xl font-bold">
                My medicines
              </h2>
              <p className={`mt-2 leading-6 ${secondaryClass}`}>
                {allowMedicineChanges
                  ? "You can record doses, add a new medicine, or ask your carer for help."
                  : "Your carer manages prescription changes and records doses. You can view your medicine schedule."}
              </p>
              {allowMedicineChanges ? (
                <button
                  className="mt-5 min-h-14 w-full rounded-xl bg-[#173B42] px-5 font-bold text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                  onClick={() => {
                    setShowAddPrescription(true);
                    setScreen("dashboard");
                  }}
                  type="button"
                >
                  Add a medicine
                </button>
              ) : (
                <div
                  className={`mt-5 rounded-xl px-4 py-3 font-bold ${
                    isDark
                      ? "bg-white text-[#173B42]"
                      : "bg-[#EEF1EE] text-[#3E555A]"
                  }`}
                >
                  Medicine changes are managed by your carer.
                </div>
              )}
            </section>

            <section
              aria-labelledby="patient-help"
              className={`rounded-2xl border-2 p-6 ${cardClass}`}
            >
              <h2 id="patient-help" className="text-2xl font-bold">
                Need help?
              </h2>
              <p className={`mt-2 leading-6 ${secondaryClass}`}>
                Tell your carer if you feel unwell or think you took the wrong dose.
              </p>
              <button
                className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#913C34] px-5 font-bold text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#F8CF73]"
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
              <span
                className={`rounded-full border-2 px-3 py-2 text-sm font-bold ${
                  isDark ? "border-white" : "border-[#276D64] text-[#276D64]"
                }`}
              >
                Icons and labels enabled
              </span>
            )}
            {reducedMotion && (
              <span
                className={`rounded-full border-2 px-3 py-2 text-sm font-bold ${
                  isDark ? "border-white" : "border-[#276D64] text-[#276D64]"
                }`}
              >
                Reduced motion
              </span>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#172E35]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-[#173B42] px-5 py-8 text-white lg:flex">
          <div className="flex items-center gap-4 px-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8CF73] text-[#173B42]">
              <Icon name="medication" className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AccessCare</span>
          </div>

          <nav aria-label="Main navigation" className="mt-10 space-y-2">
            {navItems.map((item) => (
              <button
                aria-current={isNavActive(item.target) ? "page" : undefined}
                key={item.label}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 text-left font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F8CF73] ${
                  isNavActive(item.target)
                    ? "bg-white text-[#173B42]"
                    : "text-[#C9D7D8] hover:bg-white/10 hover:text-white"
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
              className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold text-[#C9D7D8] hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-[#F8CF73]"
              onClick={() => setScreen("help")}
              type="button"
            >
              <Icon name="help" className="h-6 w-6" />
              Help & support
            </button>
            <button
              className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 font-bold text-[#C9D7D8] hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-[#F8CF73]"
              onClick={() => setScreen("settings")}
              type="button"
            >
              <Icon name="settings" className="h-6 w-6" />
              Settings
            </button>
            <button
              className="mt-5 flex w-full items-center gap-3 border-t border-white/15 px-3 pt-6 text-left focus-visible:outline-3 focus-visible:outline-[#F8CF73]"
              onClick={() => setScreen("profile")}
              type="button"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#CFE2DC] font-bold text-[#173B42]">
                {carerInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{carerName}</p>
                <p className="truncate text-sm text-[#C9D7D8]">Carer account</p>
              </div>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between border-b border-[#DDE2DE] bg-[#F7F6F1]/90 px-5 backdrop-blur md:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B42] text-[#F8CF73]">
                <Icon name="medication" />
              </div>
              <span className="hidden font-bold sm:block">AccessCare</span>
            </div>
            <p className="hidden text-sm font-semibold text-[#526267] lg:block">
              Monday, June 16
            </p>
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label={reminderOn ? "Turn reminders off" : "Turn reminders on"}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42] ${
                  reminderOn
                    ? "border-[#BCD8D1] bg-[#E8F3EF] text-[#276D64]"
                    : "border-[#71827D] bg-white text-[#526267]"
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
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#71827D] bg-white hover:bg-[#EEF1EE] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
                onClick={() => {
                  setToast("No new urgent notifications.");
                  window.setTimeout(() => setToast(""), 2800);
                }}
                type="button"
              >
                <Icon name="bell" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E27064] ring-2 ring-white" />
              </button>
            </div>
          </header>

          <nav
            aria-label="Mobile navigation"
            className="flex gap-2 overflow-x-auto border-b border-[#DDE2DE] bg-white px-4 py-3 lg:hidden"
          >
            {navItems.map((item) => (
              <button
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#F0F3F0] px-4 text-sm font-bold text-[#173B42] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                key={item.label}
                onClick={() => goTo(item.target)}
                type="button"
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#F0F3F0] px-4 text-sm font-bold text-[#173B42] focus-visible:outline-3 focus-visible:outline-[#173B42]"
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
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#276D64]">
                  {patientName}’s care plan · fictional medicines
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-[#173B42] md:text-4xl">
                  Good morning, {carerName.split(" ")[0] || "Carer"}
                </h1>
                <p className="mt-2 text-base text-[#526267]">
                  {patientName} has {medications.length} prescriptions scheduled today.
                </p>
              </div>
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#173B42] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                onClick={() => setShowAddPrescription(true)}
                type="button"
              >
                <Icon name="plus" />
                Add prescription
              </button>
            </section>

            <section
              aria-labelledby="next-dose-heading"
              className="mt-8 overflow-hidden rounded-2xl bg-[#DDEDE7]"
              id="next-reminder"
            >
              <div className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center md:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#276D64] shadow-sm">
                    <Icon name="bell" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#276D64]">
                      Next reminder · in 20 minutes
                    </p>
                    <h2 id="next-dose-heading" className="mt-1 text-xl font-bold">
                      Medicine 2, 500 mg
                    </h2>
                    <p className="mt-1 text-base font-medium text-[#3E555A]">
                      8:30 AM · Take 1 tablet with breakfast
                    </p>
                  </div>
                </div>
                <button
                  className="min-h-11 rounded-xl border-2 border-[#276D64] bg-transparent px-5 text-sm font-bold text-[#276D64] hover:bg-white/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
                  onClick={() => {
                    setToast("Reminder moved to 8:40 AM.");
                    window.setTimeout(() => setToast(""), 2800);
                  }}
                  type="button"
                >
                  Remind me in 10 min
                </button>
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
                    <p className="mt-1 text-base text-[#526267]">
                      Record whether each dose was “Given” or “Not given.”
                    </p>
                  </div>
                  <button
                    className="hidden min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42] sm:flex"
                    onClick={() => setShowAddPrescription(true)}
                    type="button"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Add prescription
                  </button>
                </div>

                <div className="space-y-4">
                  {medications.map((medication) => (
                    <article
                      key={medication.id}
                      className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(23,59,66,0.04)] transition md:p-6 ${
                        medication.status === "taken"
                          ? "border-[#B7D7CF]"
                          : medication.status === "missed"
                            ? "border-[#E5C4BF]"
                            : "border-[#E1E4E1]"
                      }`}
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          {medication.imageUrl ? (
                            <img
                              alt={`${medication.name} packaging`}
                              className="mt-1 h-12 w-12 shrink-0 rounded-xl border border-[#71827D] object-cover"
                              src={medication.imageUrl}
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${medication.color} text-white`}
                            >
                              <Icon name="medication" className="h-6 w-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold">{medication.name}</h3>
                              <span className="rounded-full bg-[#EEF1EE] px-2.5 py-1 text-sm font-semibold text-[#526267]">
                                {medication.purpose}
                              </span>
                            </div>
                            <p className="mt-1 font-bold text-[#3E555A]">
                              {medication.dosage}
                            </p>
                            <p className="mt-1 text-base text-[#526267]">
                              {medication.instructions}
                            </p>
                            {medication.reminderTimes &&
                              medication.reminderTimes.length > 1 && (
                                <p className="mt-2 text-sm font-bold text-[#276D64]">
                                  {medication.reminderTimes.length} daily reminders:{" "}
                                  {medication.reminderTimes.join(", ")}
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-t border-[#ECEEEC] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                          <div className="w-16 text-center">
                            <p className="text-xl font-bold">{medication.time}</p>
                            <p className="text-sm font-bold text-[#526267]">
                              {medication.period}
                            </p>
                          </div>
                          {medication.status === "pending" ? (
                            <div className="flex flex-1 gap-2 md:flex-none">
                              <button
                                aria-label={`Mark ${medication.name} as given to ${patientName}`}
                                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064] md:flex-none"
                                onClick={() => markTaken(medication.id)}
                                type="button"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-white">
                                  <Icon name="check" className="h-3 w-3" />
                                </span>
                                Given
                              </button>
                              <button
                                aria-label={`Mark ${medication.name} as not given to ${patientName}`}
                                className="min-h-12 rounded-xl border border-[#71827D] px-3 text-sm font-bold text-[#526267] hover:bg-[#F1F3F1] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
                                onClick={() => setReasonFor(medication.id)}
                                type="button"
                              >
                                Not given
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${
                                medication.status === "taken"
                                  ? "bg-[#E8F3EF] text-[#276D64]"
                                  : "bg-[#FAECE9] text-[#A14940]"
                              }`}
                            >
                              <Icon
                                name={medication.status === "taken" ? "check" : "close"}
                                className="h-4 w-4"
                              />
                              {medication.status === "taken" ? "Given" : "Not given"}
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
                  className="rounded-2xl border border-[#E1E4E1] bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 id="progress-heading" className="text-lg font-bold">
                      This week
                    </h2>
                    <button
                      aria-label="More adherence options"
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F0F2EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                      type="button"
                    >
                      <Icon name="more" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold tracking-tight">92%</p>
                      <p className="mt-1 text-base text-[#526267]">Doses given on time</p>
                    </div>
                    <span className="rounded-full bg-[#E8F3EF] px-3 py-1.5 text-sm font-bold text-[#276D64]">
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
                              ? "bg-[#41998E] text-white"
                              : "bg-[#FAECE9] text-[#A14940]"
                          }`}
                        >
                          <Icon
                            name={complete ? "check" : "close"}
                            className="h-4 w-4"
                          />
                        </div>
                        <p className="mt-2 text-sm font-bold text-[#526267]">{day}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  aria-labelledby="log-heading"
                  className="rounded-2xl border border-[#E1E4E1] bg-white p-6"
                  id="medicine-log"
                >
                  <div className="flex items-center justify-between">
                    <h2 id="log-heading" className="text-lg font-bold">
                      Medicine log
                    </h2>
                    <button
                      className="min-h-10 rounded-lg px-2 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                      type="button"
                    >
                      View all
                    </button>
                  </div>
                  <ul className="mt-3 divide-y divide-[#ECEEEC]">
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EF] text-[#276D64]">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 1 · 10 mg
                        </p>
                        <p className="text-sm text-[#526267]">Yesterday, 8:04 AM</p>
                      </div>
                      <span className="text-sm font-bold text-[#276D64]">Given</span>
                    </li>
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EF] text-[#276D64]">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 2 · 500 mg
                        </p>
                        <p className="text-sm text-[#526267]">Yesterday, 8:32 AM</p>
                      </div>
                      <span className="text-sm font-bold text-[#276D64]">Given</span>
                    </li>
                    <li className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAECE9] text-[#A14940]">
                        <Icon name="close" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold">
                          Medicine 3 · 1,000 IU
                        </p>
                        <p className="text-sm text-[#526267]">
                          Sun, 1:00 PM · {patientName} refused
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#913C34]">Not given</span>
                    </li>
                  </ul>
                </section>

                <section
                  aria-labelledby="emergency-heading"
                  className="scroll-mt-6 overflow-hidden rounded-2xl border-2 border-[#B45248] bg-white"
                  id="emergency-contacts"
                >
                  <div className="bg-[#FAECE9] p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#913C34] text-white">
                        <Icon name="phone" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#913C34]">
                          Medication error support
                        </p>
                        <h2 id="emergency-heading" className="mt-1 text-xl font-bold">
                          Possible missed or incorrect dose?
                        </h2>
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-6 text-[#3E555A]">
                      Do not give another dose until you have received clinical advice.
                      Contact {patientName}’s doctor or nurse now.
                    </p>
                    <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#913C34]">
                      If {patientName} is seriously unwell, call your local emergency
                      services immediately.
                    </p>
                  </div>

                  <div className="divide-y divide-[#DDE2DE] p-2">
                    <div className="p-3">
                      <p className="text-base font-bold">On-call doctor</p>
                      <p className="mt-1 text-sm text-[#526267]">
                        For incorrect, extra, or missed doses · Available 24 hours
                      </p>
                      <button
                        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white hover:bg-[#24515A] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
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
                      <p className="mt-1 text-sm text-[#526267]">
                        For medication guidance and care support · 7 AM–10 PM
                      </p>
                      <button
                        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#276D64] bg-white px-4 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
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
        <div
          aria-labelledby="prescription-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102C33]/55 p-4"
          role="dialog"
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#276D64]">
                  Manage prescriptions
                </p>
                <h2 id="prescription-title" className="mt-1 text-2xl font-bold">
                  Add a new prescription
                </h2>
                <p className="mt-2 text-base text-[#526267]">
                  The prescription will be added as Medicine {medications.length + 1}.
                </p>
              </div>
              <button
                aria-label="Close add prescription dialog"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#F0F2EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                onClick={() => setShowAddPrescription(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-base font-bold">
                  Medicine photo <span className="font-normal text-[#526267]">(optional)</span>
                </span>
                <span className="flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#71827D] bg-[#F7F8F6] p-4 text-center transition hover:bg-[#EEF1EE] focus-within:border-[#276D64] focus-within:ring-3 focus-within:ring-[#BCD8D1]">
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setMedicineImage(URL.createObjectURL(file));
                    }}
                    type="file"
                  />
                  {medicineImage ? (
                    <span className="flex items-center gap-4">
                      <img
                        alt="Selected medicine preview"
                        className="h-20 w-20 rounded-xl border border-[#71827D] object-cover"
                        src={medicineImage}
                      />
                      <span className="text-left">
                        <span className="block font-bold text-[#173B42]">Photo added</span>
                        <span className="mt-1 block text-sm text-[#526267]">
                          Select to choose a different photo
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>
                      <Icon name="image" className="mx-auto h-7 w-7 text-[#276D64]" />
                      <span className="mt-2 block font-bold text-[#173B42]">
                        Add a photo of the medicine
                      </span>
                      <span className="mt-1 block text-sm text-[#526267]">
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
                    className="min-h-12 w-full rounded-xl border-2 border-[#71827D] bg-white px-4 text-base text-[#172E35] outline-none placeholder:text-[#6A787C] focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                    onChange={(event) => setNewDosage(event.target.value)}
                    placeholder="For example: 20 mg"
                    type="text"
                    value={newDosage}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-base font-bold">Quantity</span>
                  <input
                    className="min-h-12 w-full rounded-xl border-2 border-[#71827D] bg-white px-4 text-base text-[#172E35] outline-none placeholder:text-[#6A787C] focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
                    onChange={(event) => setNewQuantity(event.target.value)}
                    placeholder="For example: 1 tablet"
                    type="text"
                    value={newQuantity}
                  />
                </label>
              </div>

              <fieldset>
                <legend className="mb-2 text-base font-bold">Reminder times</legend>
                <p className="mb-3 text-sm text-[#526267]">
                  Add every time this medicine should be given.
                </p>
                <div className="space-y-3">
                  {newTimes.map((reminderTime, index) => (
                    <div className="flex items-center gap-2" key={index}>
                      <label className="sr-only" htmlFor={`reminder-${index}`}>
                        Reminder time {index + 1}
                      </label>
                      <select
                        className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-[#71827D] bg-white px-4 text-base text-[#172E35] outline-none focus:border-[#276D64] focus:ring-3 focus:ring-[#BCD8D1]"
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
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                        <option value="9:00 PM">9:00 PM</option>
                      </select>
                      {newTimes.length > 1 && (
                        <button
                          aria-label={`Remove reminder time ${index + 1}`}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#71827D] text-[#913C34] hover:bg-[#FAECE9] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
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
                  className="mt-3 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#276D64] hover:bg-[#E8F3EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
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
                className="min-h-12 flex-1 rounded-xl border border-[#71827D] px-4 text-sm font-bold hover:bg-[#F1F3F1] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
                onClick={() => setShowAddPrescription(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-12 flex-1 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white enabled:hover:bg-[#24515A] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                disabled={!prescriptionIsComplete}
                onClick={savePrescription}
                type="button"
              >
                Add prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {reasonFor !== null && (
        <div
          aria-labelledby="reason-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102C33]/55 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#A14940]">Dose not given</p>
                <h2 id="reason-title" className="mt-1 text-2xl font-bold">
                  Why was this dose not given?
                </h2>
                <p className="mt-2 text-base leading-6 text-[#526267]">
                  Record what happened when you offered this medicine to {patientName}.
                  This information will be added to the patient’s care log.
                </p>
              </div>
              <button
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#F0F2EF] focus-visible:outline-3 focus-visible:outline-[#173B42]"
                onClick={() => setReasonFor(null)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">
                Reason the dose was not given to {patientName}
              </legend>
              {[
                `${patientName} refused to take the medicine`,
                `${patientName} was asleep`,
                `${patientName} felt unwell`,
                "The medicine was unavailable",
                "The dose was withheld following clinical advice",
                "I was unable to administer the medicine",
                "Other reason",
              ].map((option) => (
                <label
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition ${
                    reason === option
                      ? "border-[#276D64] bg-[#E8F3EF] text-[#173B42]"
                      : "border-[#71827D] hover:bg-[#F7F8F6]"
                  }`}
                  key={option}
                >
                  <input
                    checked={reason === option}
                    className="h-5 w-5 accent-[#276D64]"
                    name="missed-reason"
                    onChange={() => setReason(option)}
                    type="radio"
                    value={option}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
            <div className="mt-7 flex gap-3">
              <button
                className="min-h-12 flex-1 rounded-xl border border-[#71827D] px-4 text-sm font-bold hover:bg-[#F1F3F1] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#173B42]"
                onClick={() => setReasonFor(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-12 flex-1 rounded-xl bg-[#173B42] px-4 text-sm font-bold text-white enabled:hover:bg-[#24515A] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#E27064]"
                disabled={!reason}
                onClick={saveMissed}
                type="button"
              >
                Save to care log
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-xl bg-[#173B42] px-5 text-sm font-bold text-white shadow-xl"
          role="status"
        >
          <Icon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
