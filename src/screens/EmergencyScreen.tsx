import { Icon } from "../components/Icon";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";

export function EmergencyScreen({
  details,
  setToast,
  shell,
}: {
  details: Details;
  setToast: (message: string) => void;
  shell: CarerPageShell;
}) {
  const { patientName } = details;

  return (
    <CarerPage
      {...shell}
      description="Use these contacts if a dose is missed, duplicated, incorrect, or causes concern."
      eyebrow="Urgent support"
      title="Emergency contacts"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-danger bg-danger-subtle p-6 lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-danger">
            Possible medication error
          </p>
          <h2 className="mt-2 text-2xl font-bold">Do not give another dose</h2>
          <p className="mt-2 max-w-3xl leading-7 text-ink-soft">
            Contact a clinician for advice. If {patientName} is seriously unwell, call
            your local emergency services immediately.
          </p>
        </section>
        {[
          ["On-call doctor", "Incorrect, extra, or missed doses", "Available 24 hours"],
          ["Community nurse", "Medication guidance and care support", "7 AM–10 PM"],
        ].map(([name, purpose, availability]) => (
          <article className="rounded-2xl border border-line bg-surface p-6" key={name}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon name="phone" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <p className="mt-2 text-ink-muted">{purpose}</p>
            <p className="mt-3 text-sm font-bold text-accent">{availability}</p>
            <button
              className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-focus-on-primary"
              onClick={() => {
                setToast(`Contacting ${name.toLowerCase()}.`);
                window.setTimeout(() => setToast(""), 2800);
              }}
              type="button"
            >
              Call {name.toLowerCase()}
            </button>
          </article>
        ))}
        <button
          className="min-h-14 rounded-xl border-2 border-danger bg-surface px-5 font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-focus lg:col-span-2"
          onClick={() => {
            setToast("Medication incident form opened.");
            window.setTimeout(() => setToast(""), 2800);
          }}
          type="button"
        >
          Record a medication incident
        </button>
      </div>
    </CarerPage>
  );
}
