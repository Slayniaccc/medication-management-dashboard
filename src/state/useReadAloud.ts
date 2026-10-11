import { useEffect, useState } from "react";
import type { Medication, Occurrence } from "../model/types";
import { formatTime } from "../screens/format";

// Speaks the patient view's next dose with the browser's own voice. It is for
// someone who does not use a screen reader, so it never starts by itself: it
// speaks only when asked, can be stopped, and stops when the view is left.
export function useReadAloud({
  active,
  hasMedicines,
  nextDose,
  nextMedication,
  patientName,
}: {
  // Whether the button that stops it can be reached: the patient view is
  // showing and no dialog is open over it.
  active: boolean;
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

  // Speech belongs to the page, not to the view, so it would carry on over
  // whatever came next, with nothing on screen to stop it. This hook outlives
  // the patient view, so it is told when the view is left or covered.
  useEffect(() => {
    if (!supported || !active) return;
    return () => {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [active, supported]);

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
