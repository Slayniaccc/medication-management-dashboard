import { Icon } from "../components/Icon";
import { CarerPage, type CarerPageShell } from "./CarerPage";

export function HelpScreen({
  setToast,
  shell,
}: {
  setToast: (message: string) => void;
  shell: CarerPageShell;
}) {
  const { setScreen } = shell;

  return (
    <CarerPage
      {...shell}
      description="Get help using AccessCare or contact the care team."
      eyebrow="Support centre"
      title="Help & support"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {[
          ["Medication help", "Get support with prescriptions, reminders, and dose logs."],
          ["Accessibility help", "Get help adapting the patient experience."],
          ["Account help", "Get support with consent, profiles, and permissions."],
          ["Contact support", "Speak to the AccessCare support team."],
        ].map(([title, description], index) => (
          <button
            className="rounded-2xl border border-line bg-surface p-6 text-left hover:border-accent hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-focus"
            key={title}
            onClick={() => {
              if (index === 0) {
                setScreen("prescriptions");
              } else if (index === 1) {
                setScreen("setup");
              } else if (index === 2) {
                setScreen("profile");
              } else {
                setToast("Support request started.");
                window.setTimeout(() => setToast(""), 2800);
              }
            }}
            type="button"
          >
            <Icon name={index === 3 ? "phone" : "help"} className="h-7 w-7 text-accent" />
            <span className="mt-4 block text-xl font-bold">{title}</span>
            <span className="mt-2 block leading-6 text-ink-muted">{description}</span>
          </button>
        ))}
      </div>
    </CarerPage>
  );
}
