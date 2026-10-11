import { CarerPage, type CarerPageShell } from "./CarerPage";
import { screenNames, type Screen } from "./navigation";

const sections: Array<{ title: string; body: string; screen: Screen }> = [
  {
    title: "Logging a dose",
    body: "The dashboard lists today’s doses in time order. Press Given, or press Not given and choose the reason. Each one is kept in the medicine log with the time it was due and the time you logged it.",
    screen: "dashboard",
  },
  {
    title: "Adding and removing medicines",
    body: "Add a prescription with its name, strength, amount and times of day. Removing one stops its doses from today and keeps everything already logged. A removed prescription can be added back.",
    screen: "prescriptions",
  },
  {
    title: "Making the patient view easier to use",
    body: "Patient setup changes the patient view only: its colours, text size and layout, whether it has a read aloud button, and whether doses can be logged from it.",
    screen: "setup",
  },
  {
    title: "Where everything is kept",
    body: "On this device, in this browser, and nowhere else. There is no account and nothing is sent anywhere. Clearing this browser’s data for this site removes it.",
    screen: "settings",
  },
];

export function HelpScreen({ shell }: { shell: CarerPageShell }) {
  const { goTo } = shell;

  return (
    <CarerPage
      {...shell}
      description="How AccessCare works, and what it does not do."
      eyebrow="About this app"
      title="Help"
    >
      <section
        aria-labelledby="notebook-heading"
        className="max-w-3xl rounded-2xl border-2 border-line-strong bg-surface p-6"
      >
        <h2 id="notebook-heading" className="text-xl font-bold">
          AccessCare is a notebook
        </h2>
        <p className="mt-2 text-base leading-7 text-ink-soft">
          It keeps what you enter and shows it back to you. It does not give medical advice,
          check a dose, warn about medicines or say what a pattern in the log means. Questions
          about a medicine are for a pharmacist, doctor or nurse.
        </p>
      </section>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {sections.map(({ body, screen, title }) => (
          <li className="rounded-2xl border border-line bg-surface p-6" key={title}>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-base leading-7 text-ink-soft">{body}</p>
            <button
              className="mt-4 min-h-11 rounded-xl border-2 border-accent px-4 text-sm font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => goTo(screen)}
              type="button"
            >
              Go to {screenNames[screen]}
            </button>
          </li>
        ))}
      </ul>
    </CarerPage>
  );
}
