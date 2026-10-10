import { useEffect, useRef, useState } from "react";
import { doseStatus, occurrencesOn, recordDose } from "./model/doses";
import { closeSchedule, isInForce } from "./model/schedules";
import { isTimeOfDay, localDateOf, toInstant } from "./model/time";
import type {
  DoseEvent,
  Medication,
  NotGivenReason,
  OccurrenceKey,
  RecordedBy,
  Schedule,
} from "./model/types";
import { AddPrescriptionDialog } from "./screens/AddPrescriptionDialog";
import type { CarerPageShell } from "./screens/CarerPage";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EmergencyScreen } from "./screens/EmergencyScreen";
import { formatTime } from "./screens/format";
import { HelpScreen } from "./screens/HelpScreen";
import { LogScreen } from "./screens/LogScreen";
import type { Screen } from "./screens/navigation";
import { NotGivenReasonDialog } from "./screens/NotGivenReasonDialog";
import { PatientScreen } from "./screens/PatientScreen";
import { PrescriptionsScreen } from "./screens/PrescriptionsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RemindersScreen } from "./screens/RemindersScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupScreen } from "./screens/SetupScreen";
import type {
  Details,
  PatientTheme,
  Repository,
  Snapshot,
  TextSize,
} from "./storage/repository";

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

  const shell: CarerPageShell = {
    carerInitials,
    carerName,
    goTo,
    isNavActive,
    screen,
    setScreen,
    toast,
  };

  if (screen === "prescriptions") {
    return (
      <PrescriptionsScreen
        activeMedications={activeMedications}
        details={details}
        reminderTimesFor={reminderTimesFor}
        removePrescription={removePrescription}
        setShowAddPrescription={setShowAddPrescription}
        setToast={setToast}
        shell={shell}
      />
    );
  }

  if (screen === "reminders") {
    return (
      <RemindersScreen
        activeSchedules={activeSchedules}
        details={details}
        medicationById={medicationById}
        setReminderOn={setReminderOn}
        setSoundAlerts={setSoundAlerts}
        setToast={setToast}
        shell={shell}
      />
    );
  }

  if (screen === "log") {
    return (
      <LogScreen
        details={details}
        events={events}
        medicationById={medicationById}
        now={now}
        setToast={setToast}
        shell={shell}
      />
    );
  }

  if (screen === "emergency") {
    return <EmergencyScreen details={details} setToast={setToast} shell={shell} />;
  }

  if (screen === "settings") {
    return (
      <SettingsScreen
        details={details}
        setEmailUpdates={setEmailUpdates}
        setSoundAlerts={setSoundAlerts}
        shell={shell}
      />
    );
  }

  if (screen === "help") {
    return <HelpScreen setToast={setToast} shell={shell} />;
  }

  if (screen === "profile") {
    return (
      <ProfileScreen
        carerInitials={carerInitials}
        details={details}
        editingCarer={editingCarer}
        patientInitials={patientInitials}
        setCarerAvailability={setCarerAvailability}
        setCarerEmail={setCarerEmail}
        setCarerName={setCarerName}
        setCarerPhone={setCarerPhone}
        setCarerRelationship={setCarerRelationship}
        setEditingCarer={setEditingCarer}
        setScreen={setScreen}
      />
    );
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        details={details}
        setAllowMedicineChanges={setAllowMedicineChanges}
        setColourSafe={setColourSafe}
        setConsentDate={setConsentDate}
        setConsentGiven={setConsentGiven}
        setConsentMethod={setConsentMethod}
        setDisabilities={setDisabilities}
        setMedicalNeeds={setMedicalNeeds}
        setPatientAge={setPatientAge}
        setPatientName={setPatientName}
        setPatientTheme={setPatientTheme}
        setReadAloud={setReadAloud}
        setReducedMotion={setReducedMotion}
        setScreen={setScreen}
        setSimplifiedLayout={setSimplifiedLayout}
        setTextSize={setTextSize}
        setToast={setToast}
      />
    );
  }

  if (screen === "patient") {
    return (
      <PatientScreen
        activeMedications={activeMedications}
        details={details}
        goTo={goTo}
        markGiven={markGiven}
        medicationById={medicationById}
        nextDose={nextDose}
        nextMedication={nextMedication}
        readPatientPage={readPatientPage}
        setReasonFor={setReasonFor}
        setScreen={setScreen}
        setShowAddPrescription={setShowAddPrescription}
        todaysDoses={todaysDoses}
      />
    );
  }

  return (
    <DashboardScreen
      activeMedications={activeMedications}
      details={details}
      markGiven={markGiven}
      nextDose={nextDose}
      nextMedication={nextMedication}
      now={now}
      reminderTimesFor={reminderTimesFor}
      setReasonFor={setReasonFor}
      setReminderOn={setReminderOn}
      setShowAddPrescription={setShowAddPrescription}
      setToast={setToast}
      shell={shell}
      todaysRows={todaysRows}
    >
      {showAddPrescription && (
        <AddPrescriptionDialog
          medications={medications}
          medicineImage={medicineImage}
          newDosage={newDosage}
          newQuantity={newQuantity}
          newTimes={newTimes}
          prescriptionIsComplete={prescriptionIsComplete}
          savePrescription={savePrescription}
          setMedicineImage={setMedicineImage}
          setNewDosage={setNewDosage}
          setNewQuantity={setNewQuantity}
          setNewTimes={setNewTimes}
          setShowAddPrescription={setShowAddPrescription}
        />
      )}

      {reasonFor !== null && (
        <NotGivenReasonDialog
          details={details}
          reason={reason}
          saveNotGiven={saveNotGiven}
          setReason={setReason}
          setReasonFor={setReasonFor}
        />
      )}
    </DashboardScreen>
  );
}
