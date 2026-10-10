import { AddPrescriptionDialog } from "./screens/AddPrescriptionDialog";
import type { CarerPageShell } from "./screens/CarerPage";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EmergencyScreen } from "./screens/EmergencyScreen";
import { HelpScreen } from "./screens/HelpScreen";
import { LogScreen } from "./screens/LogScreen";
import { NotGivenReasonDialog } from "./screens/NotGivenReasonDialog";
import { PatientScreen } from "./screens/PatientScreen";
import { PrescriptionsScreen } from "./screens/PrescriptionsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RemindersScreen } from "./screens/RemindersScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { useClock } from "./state/useClock";
import { useDetails } from "./state/useDetails";
import { useNavigation } from "./state/useNavigation";
import { useNotGivenReason } from "./state/useNotGivenReason";
import { usePrescriptionDraft } from "./state/usePrescriptionDraft";
import { useReadAloud } from "./state/useReadAloud";
import { useRoutine } from "./state/useRoutine";
import { useToast } from "./state/useToast";
import type { Repository, Snapshot } from "./storage/repository";

// Composition only: the state lives in the hooks under src/state, and this
// joins them up and hands each screen what it reads and what it can change.
export default function App({
  initial,
  onSaveFailed,
  onViewChange,
  repository,
}: {
  initial: Snapshot;
  onSaveFailed: () => void;
  onViewChange: (name: string) => void;
  repository: Repository;
}) {
  const { flashToast, setToast, toast } = useToast();
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
    setEmailUpdates,
    setMedicalNeeds,
    setPatientAge,
    setPatientName,
    setPatientTheme,
    setReadAloud,
    setReducedMotion,
    setReminderOn,
    setSimplifiedLayout,
    setSoundAlerts,
    setTextSize,
  } = useDetails({ initial: initial.details, onSaveFailed, repository });
  const {
    activeMedications,
    activeSchedules,
    addPrescription,
    events,
    markGiven,
    markNotGiven,
    medicationById,
    medications,
    nextDose,
    nextMedication,
    reminderTimesFor,
    removePrescription,
    todaysDoses,
    todaysRows,
  } = useRoutine({ flashToast, initial, now, onSaveFailed, repository });
  const { goTo, isNavActive, screen, setScreen } = useNavigation({
    onViewChange,
    reducedMotion: details.reducedMotion,
  });
  const {
    medicineImage,
    newDosage,
    newQuantity,
    newTimes,
    prescriptionIsComplete,
    savePrescription,
    setMedicineImage,
    setNewDosage,
    setNewQuantity,
    setNewTimes,
    setShowAddPrescription,
    showAddPrescription,
  } = usePrescriptionDraft({ addPrescription });
  const { reason, reasonFor, saveNotGiven, setReason, setReasonFor } = useNotGivenReason({
    markNotGiven,
  });
  const readPatientPage = useReadAloud({
    nextDose,
    nextMedication,
    patientName: details.patientName,
    setToast,
  });

  const shell: CarerPageShell = {
    carerInitials,
    carerName: details.carerName,
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
