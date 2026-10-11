import { useState } from "react";
import { flushSync } from "react-dom";
import { CarerPage, type CarerPageShell } from "./CarerPage";

export function SettingsScreen({
  clearExample,
  durable,
  shell,
}: {
  clearExample: () => void;
  // Whether this browser is keeping anything at all.
  durable: boolean;
  shell: CarerPageShell;
}) {
  const { exampleData, goTo } = shell;
  // Clearing takes two presses.
  const [confirming, setConfirming] = useState(false);

  const moveFocus = (change: () => void, toId: string) => {
    flushSync(change);
    document.getElementById(toId)?.focus();
  };

  return (
    <CarerPage
      {...shell}
      description="How the patient view looks, and what is kept on this device."
      eyebrow="This device"
      title="Settings"
    >
      <div className="grid gap-7 lg:grid-cols-2">
        <section
          aria-labelledby="patient-view-settings"
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h2 id="patient-view-settings" className="text-xl font-bold">
            Patient view
          </h2>
          <p className="mt-2 text-base leading-7 text-ink-muted">
            Colours, text size, layout, the read aloud button and whether doses can be logged
            from the patient view are all in patient setup.
          </p>
          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
            onClick={() => goTo("setup")}
            type="button"
          >
            Go to Patient setup
          </button>
        </section>

        <section
          aria-labelledby="data-settings"
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h2 id="data-settings" className="text-xl font-bold">
            What is kept, and where
          </h2>
          <p className="mt-2 text-base leading-7 text-ink-muted">
            {durable
              ? "Your medicines, the medicine log and your details are kept on this device, in this browser. There is no account, and nothing is sent anywhere. Another phone or computer will not show them."
              : "This browser is not letting AccessCare keep anything, so what you enter lasts only until this page is closed or refreshed."}
          </p>

          {exampleData &&
            (confirming ? (
              <div
                aria-labelledby="clear-example-question"
                className="mt-5 rounded-xl border-2 border-danger p-4"
                role="group"
              >
                <p className="font-bold" id="clear-example-question">
                  Clear the example?
                </p>
                <p className="mt-1 text-base text-ink-soft" id="clear-example-detail">
                  The made-up people, medicines and doses are removed, along with anything you
                  logged while looking around. You start again from the welcome page, where the
                  example can be loaded again.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    aria-describedby="clear-example-detail"
                    className="min-h-12 flex-1 rounded-xl border-2 border-line-strong px-4 text-sm font-bold hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    id="keep-example"
                    onClick={() => moveFocus(() => setConfirming(false), "clear-example")}
                    type="button"
                  >
                    Keep the example
                  </button>
                  <button
                    className="min-h-12 flex-1 rounded-xl bg-danger px-4 text-sm font-bold text-on-danger focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    onClick={clearExample}
                    type="button"
                  >
                    Clear the example
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="mt-5 min-h-12 w-full rounded-xl border-2 border-danger px-5 font-bold text-danger hover:bg-danger-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                id="clear-example"
                onClick={() => moveFocus(() => setConfirming(true), "keep-example")}
                type="button"
              >
                Clear the example and start with my own
              </button>
            ))}
        </section>
      </div>
    </CarerPage>
  );
}
