import { useEffect, useState } from "react";
import type { Medication, Occurrence } from "../model/types";
import { formatTime } from "../screens/format";

// Speaks the patient view's next dose with the browser's own voice. It is for
// someone who does not use a screen reader, so it never starts by itself: it
// speaks only when asked, can be stopped, and stops when the view is left.
export function useReadAloud({
  hasMedicines,
  nextDose,
  nextMedication,
  patientName,
}: {
  hasMedicines: boolean;
  nextDose: Occurrence | null;
  nextMedication: Medication | null;
  patientName: string;
}) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  const stop = () => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Speech belongs to the page, not to the component, so it would carry on
  // over whatever view came next.
  useEffect(() => {
    if (!supported) return;
    return () => window.speechSynthesis.cancel();
  }, [supported]);

  const start = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const firstName = patientName.split(" ")[0];
    const greeting = firstName ? `Hello ${firstName}.` : "Hello.";
    const message = new SpeechSynthesisUtterance(
      nextDose && nextMedication
        ? `${greeting} Your next medicine is ${nextMedication.name}, ${nextMedication.strength}, ${nextMedication.form}, at ${formatTime(nextDose.timeOfDay)}.`
        : hasMedicines
          ? `${greeting} Every medicine for today has been recorded.`
          : `${greeting} No medicines have been added yet.`,
    );
    message.rate = 0.85;
    message.onend = () => setSpeaking(false);
    message.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(message);
  };

  return { speaking, start, stop, supported };
}
