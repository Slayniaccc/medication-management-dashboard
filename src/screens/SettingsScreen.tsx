import type { Dispatch, SetStateAction } from "react";
import { ToggleRow } from "../components/ToggleRow";
import type { Details } from "../storage/repository";
import { CarerPage, type CarerPageShell } from "./CarerPage";

export function SettingsScreen({
  details,
  setEmailUpdates,
  setSoundAlerts,
  shell,
}: {
  details: Details;
  setEmailUpdates: Dispatch<SetStateAction<boolean>>;
  setSoundAlerts: Dispatch<SetStateAction<boolean>>;
  shell: CarerPageShell;
}) {
  const { emailUpdates, soundAlerts } = details;
  const { setScreen } = shell;

  return (
    <CarerPage
      {...shell}
      description="Manage carer notifications and patient accessibility preferences."
      eyebrow="Account controls"
      title="Settings"
    >
      <div className="grid gap-7 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Carer notifications</h2>
          <div className="mt-4">
            <ToggleRow
              checked={emailUpdates}
              description="Receive a daily summary of doses and care activity."
              label="Daily email summary"
              onChange={() => setEmailUpdates((value) => !value)}
            />
            <ToggleRow
              checked={soundAlerts}
              description="Play a sound for urgent medication notifications."
              label="Sound alerts"
              onChange={() => setSoundAlerts((value) => !value)}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">Patient experience</h2>
          <p className="mt-2 leading-6 text-ink-muted">
            Configure theme, text size, read aloud, colour-safe labels, simplified layout,
            and motion preferences.
          </p>
          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary focus-visible:outline-3 focus-visible:outline-focus-on-primary"
            onClick={() => setScreen("setup")}
            type="button"
          >
            Open accessibility preferences
          </button>
        </section>
      </div>
    </CarerPage>
  );
}
