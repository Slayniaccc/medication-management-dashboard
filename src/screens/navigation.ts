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

// What each view is called when a change of view is announced. These match the
// navigation labels rather than the headings, which greet the reader by name on
// the dashboard and the patient view.
export const screenNames: Record<Screen, string> = {
  dashboard: "Dashboard",
  prescriptions: "Prescriptions",
  reminders: "Reminders",
  log: "Medicine log",
  emergency: "Emergency contacts",
  profile: "Care profile",
  setup: "Patient setup",
  patient: "Patient view",
  settings: "Settings",
  help: "Help & support",
};

// Every view has one main landmark and one h1 carrying these ids. The skip link
// targets the first, and focus moves to the second when the view changes.
export const mainId = "main";
export const viewHeadingId = "view-heading";

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
