import type { IconName } from "../components/Icon";

export type Screen =
  | "welcome"
  | "dashboard"
  | "prescriptions"
  | "reminders"
  | "log"
  | "profile"
  | "setup"
  | "patient"
  | "settings"
  | "help";

// What each view is called when a change of view is announced, and in the page
// title. These match the navigation labels rather than the headings, which
// greet the reader by name on the dashboard and the patient view.
export const screenNames: Record<Screen, string> = {
  welcome: "Welcome",
  dashboard: "Dashboard",
  prescriptions: "Prescriptions",
  reminders: "Reminders",
  log: "Medicine log",
  profile: "Your details",
  setup: "Patient setup",
  patient: "Patient view",
  settings: "Settings",
  help: "Help",
};

// Every view has one main landmark and one h1 carrying these ids. The skip link
// targets the first, and focus moves to the second when the view changes.
export const mainId = "main";
export const viewHeadingId = "view-heading";

// One list for the sidebar and for the phone, so every view can be reached
// from both. The second group sits at the foot of the sidebar.
export const navItems: Array<{ icon: IconName; screen: Screen }> = [
  { icon: "home", screen: "dashboard" },
  { icon: "medication", screen: "prescriptions" },
  { icon: "calendar", screen: "reminders" },
  { icon: "document", screen: "log" },
  { icon: "settings", screen: "setup" },
  { icon: "home", screen: "patient" },
];

export const secondaryNavItems: Array<{ icon: IconName; screen: Screen }> = [
  { icon: "user", screen: "profile" },
  { icon: "settings", screen: "settings" },
  { icon: "help", screen: "help" },
];
