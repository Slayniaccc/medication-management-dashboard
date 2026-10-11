import { AddPrescriptionDialog } from "./screens/AddPrescriptionDialog";
import type { CarerPageShell } from "./screens/CarerPage";
import { DashboardScreen } from "./screens/DashboardScreen";
import { HelpScreen } from "./screens/HelpScreen";
import { LogScreen } from "./screens/LogScreen";
import { NotGivenReasonDialog } from "./screens/NotGivenReasonDialog";
import { PatientScreen } from "./screens/PatientScreen";
import { PrescriptionsScreen } from "./screens/PrescriptionsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RemindersScreen } from "./screens/RemindersScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { useClock } from "./state/useClock";
import { useDetails } from "./state/useDetails";
import { useNavigation } from "./state/useNavigation";
import { useNotGivenReason } from "./state/useNotGivenReason";
import { usePrescriptionDraft } from "./state/usePrescriptionDraft";
import { useReadAloud } from "./state/useReadAloud";
import { useRoutine } from "./state/useRoutine";
import { useToast } from "./state/useToast";
import type { Repository, Snapshot } from "./storage/repository";
import { isFirstRun } from "./storage/snapshots";

// Composition only: the state lives in the hooks under src/state, and this
// joins them up and hands each screen what it reads and what it can change.
export default function App({
  clearExample,
  initial,
  loadExample,
  onSaveFailed,
  onViewChange,
  repository,
}: {
  clearExample: () => void;
  initial: Snapshot;
  loadExample: () => void;
  onSaveFailed: () => void;
  onViewChange: (name: string) => void;
  repository: Repository;
}) {
  const { flashToast, toast } = useToast();
  const now = useClock();
  const {
    carerInitials,
    details,
    editingCarer,
    patientInitials,
    setAllowMedicineChanges,
    setCarerAvailability,
    setCarerEmail,
    setCarerName,
    setCarerPhone,
    setCarerRelationship,
    setColourSafe,
    setConsentDate,
    setConsentGiven,
    setConsentMethod,
    setDisabilities,
    setEditingCarer,
    setMedicalNeeds,
    setPatientAge,
    setPatientName,
    setPatientTheme,
    setReadAloud,
    setReducedMotion,
    setSimplifiedLayout,
    setTextSize,
  } = useDetails({ initial: initial.details, onSaveFailed, repository });
  const {
    activeMedications,
    activeSchedules,
    addBackPrescription,
    addPrescription,
    events,
    markGiven,
    markNotGiven,
    medicationById,
    nextDose,
    nextMedication,
    reminderTimesFor,
    removePrescription,
    removedPrescriptions,
    schedules,
    todaysDoses,
    todaysRows,
  } = useRoutine({ flashToast, initial, now, onSaveFailed, repository });
  const { goTo, screen } = useNavigation({
    initialScreen: isFirstRun(initial) ? "welcome" : "dashboard",
    onViewChange,
  });
  const prescriptionDraft = usePrescriptionDraft({ addPrescription });
  const { setShowAddPrescription, showAddPrescription } = prescriptionDraft;
  const { reason, reasonFor, saveNotGiven, setReason, setReasonFor } = useNotGivenReason({
    markNotGiven,
  });
  const readAloud = useReadAloud({
    active: screen === "patient" && !showAddPrescription && reasonFor === null,
    hasMedicines: activeMedications.length > 0,
    nextDose,
    nextMedication,
    patientName: details.patientName,
  });

  const shell: CarerPageShell = { exampleData: details.exampleData, goTo, screen, toast };

  // Rendered inside whichever screen opened them, so they take that screen's
  // theme and focus goes back to the button that was pressed.
  const addPrescriptionDialog = showAddPrescription && (
    <AddPrescriptionDialog draft={prescriptionDraft} />
  );
  const reasonDialog = reasonFor !== null && (
    <NotGivenReasonDialog
      details={details}
      dose={reasonFor.dose}
      medicationName={medicationById.get(reasonFor.dose.medicationId)?.name ?? "Medicine"}
      reason={reason}
      recordedBy={reasonFor.recordedBy}
      saveNotGiven={saveNotGiven}
      setReason={setReason}
      setReasonFor={setReasonFor}
    />
  );

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        durable={repository.durable}
        loadExample={loadExample}
        start={({ carerName, patientName }) => {
          setCarerName(carerName);
          setPatientName(patientName);
          goTo("dashboard");
        }}
      />
    );
  }

  if (screen === "prescriptions") {
    return (
      <PrescriptionsScreen
        activeMedications={activeMedications}
        addBackPrescription={addBackPrescription}
        details={details}
        now={now}
        reminderTimesFor={reminderTimesFor}
        removePrescription={removePrescription}
        removedPrescriptions={removedPrescriptions}
        setShowAddPrescription={setShowAddPrescription}
        shell={shell}
      >
        {addPrescriptionDialog}
      </PrescriptionsScreen>
    );
  }

  if (screen === "reminders") {
    return (
      <RemindersScreen
        activeSchedules={activeSchedules}
        details={details}
        medicationById={medicationById}
        now={now}
        schedules={schedules}
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
        shell={shell}
      />
    );
  }

  if (screen === "settings") {
    return (
      <SettingsScreen clearExample={clearExample} durable={repository.durable} shell={shell} />
    );
  }

  if (screen === "help") {
    return <HelpScreen shell={shell} />;
  }

  if (screen === "profile") {
    return (
      <ProfileScreen
        carerInitials={carerInitials}
        details={details}
        editingCarer={editingCarer}
        goTo={goTo}
        patientInitials={patientInitials}
        setCarerAvailability={setCarerAvailability}
        setCarerEmail={setCarerEmail}
        setCarerName={setCarerName}
        setCarerPhone={setCarerPhone}
        setCarerRelationship={setCarerRelationship}
        setEditingCarer={setEditingCarer}
      />
    );
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        details={details}
        flashToast={flashToast}
        goTo={goTo}
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
        setSimplifiedLayout={setSimplifiedLayout}
        setTextSize={setTextSize}
      />
    );
  }

  if (screen === "patient") {
    return (
      <PatientScreen
        details={details}
        goTo={goTo}
        hasMedicines={activeMedications.length > 0}
        markGiven={markGiven}
        medicationById={medicationById}
        nextDose={nextDose}
        nextMedication={nextMedication}
        readAloud={readAloud}
        setReasonFor={setReasonFor}
        setShowAddPrescription={setShowAddPrescription}
        toast={toast}
        todaysDoses={todaysDoses}
      >
        {addPrescriptionDialog}
        {reasonDialog}
      </PatientScreen>
    );
  }

  return (
    <DashboardScreen
      details={details}
      markGiven={markGiven}
      nextDose={nextDose}
      nextMedication={nextMedication}
      now={now}
      setReasonFor={setReasonFor}
      setShowAddPrescription={setShowAddPrescription}
      shell={shell}
      todaysRows={todaysRows}
    >
      {addPrescriptionDialog}
      {reasonDialog}
    </DashboardScreen>
  );
}
