import { useState } from "react";
import type { Screen } from "../screens/navigation";

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

export function useNavigation({ reducedMotion }: { reducedMotion: boolean }) {
  const [screen, setScreen] = useState<Screen>("dashboard");

  const goTo = (target: string) => {
    setScreen(screenByTarget[target] ?? "dashboard");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const isNavActive = (target: string) => screenByTarget[target] === screen;

  return { goTo, isNavActive, screen, setScreen };
}
