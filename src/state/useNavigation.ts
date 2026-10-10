import { useEffect, useRef, useState } from "react";
import { screenNames, viewHeadingId, type Screen } from "../screens/navigation";

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

export function useNavigation({
  onViewChange,
  reducedMotion,
}: {
  onViewChange: (name: string) => void;
  reducedMotion: boolean;
}) {
  const [screen, setScreen] = useState<Screen>("dashboard");

  // Views are swapped rather than navigated to, so nothing tells a screen
  // reader that the page changed. Focus goes to the new heading and the name is
  // announced, once the new view is in the document. Not on first load, where
  // moving focus would take it from wherever the browser put it.
  const shown = useRef(screen);
  useEffect(() => {
    if (shown.current === screen) return;
    shown.current = screen;
    document.getElementById(viewHeadingId)?.focus();
    onViewChange(screenNames[screen]);
  }, [onViewChange, screen]);

  const goTo = (target: string) => {
    setScreen(screenByTarget[target] ?? "dashboard");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const isNavActive = (target: string) => screenByTarget[target] === screen;

  return { goTo, isNavActive, screen, setScreen };
}
