import type { IconName } from "../components/Icon";

export type Screen =
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

export const navItems: Array<{
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
