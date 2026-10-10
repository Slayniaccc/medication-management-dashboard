import type { Medication, Occurrence } from "../model/types";
import { formatTime } from "../screens/format";

// Speaks the patient view's next dose with the browser's own voice.
export function useReadAloud({
  nextDose,
  nextMedication,
  patientName,
  setToast,
}: {
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  patientName: string;
  setToast: (message: string) => void;
}) {
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

  return readPatientPage;
}
