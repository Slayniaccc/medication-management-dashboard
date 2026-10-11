import { useState } from "react";
import { FieldError } from "../components/FieldError";
import { Icon } from "../components/Icon";
import { useFormErrors, type FormErrors } from "../state/useFormErrors";
import { mainId, viewHeadingId } from "./navigation";

const fieldClass =
  "min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-4 text-base text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger";

// What a carer sees before anything has been entered. Two ways on: their own
// names, or a made-up week to look around in.
export function WelcomeScreen({
  durable,
  loadExample,
  start,
}: {
  durable: boolean;
  loadExample: () => void;
  start: (names: { carerName: string; patientName: string }) => void;
}) {
  // Held here until Start is pressed, so a half-typed name is not stored.
  const [carerName, setCarerName] = useState("");
  const [patientName, setPatientName] = useState("");

  const found: FormErrors = {};
  if (!carerName.trim()) found["welcome-carer-name"] = "Enter your name.";
  if (!patientName.trim()) {
    found["welcome-patient-name"] = "Enter the name of the person you support.";
  }
  const { checkOnSubmit, errors } = useFormErrors(found);

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center gap-3 px-5 md:px-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Icon name="medication" />
          </span>
          <span className="font-bold">AccessCare</span>
        </div>
      </header>

      <main
        className="mx-auto max-w-5xl px-5 py-8 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus md:px-8 md:py-12"
        id={mainId}
        tabIndex={-1}
      >
        <h1
          className="text-3xl font-bold tracking-tight focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus md:text-4xl"
          id={viewHeadingId}
          tabIndex={-1}
        >
          Welcome to AccessCare
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-7 text-ink-soft">
          A notebook for one person’s medicines, shared between you and the person you support.
        </p>
        <ul className="mt-5 max-w-2xl space-y-2 text-base leading-7 text-ink-soft">
          {[
            "It lists each day’s doses and keeps a log of what was given, what was not, and why.",
            durable
              ? "Everything stays on this device. There is no account and nothing is sent anywhere."
              : "This browser is not letting it keep anything, so what you enter lasts until this page is closed.",
            "It records what you enter. It does not give medical advice.",
          ].map((fact) => (
            <li className="flex gap-3" key={fact}>
              <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-accent" />
              {fact}
            </li>
          ))}
        </ul>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="welcome-start-heading"
            className="rounded-2xl border-2 border-accent bg-surface p-6 md:p-7"
          >
            <h2 id="welcome-start-heading" className="text-xl font-bold">
              Start with your own
            </h2>
            <p className="mt-2 text-base text-ink-muted">
              Two names are enough to begin. Everything else can be added later.
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block font-bold" htmlFor="welcome-carer-name">
                  Your name
                </label>
                <input
                  aria-describedby={
                    errors["welcome-carer-name"] ? "welcome-carer-name-error" : undefined
                  }
                  aria-invalid={errors["welcome-carer-name"] ? true : undefined}
                  aria-required="true"
                  autoComplete="name"
                  className={fieldClass}
                  id="welcome-carer-name"
                  onChange={(event) => setCarerName(event.target.value)}
                  type="text"
                  value={carerName}
                />
                <FieldError
                  id="welcome-carer-name-error"
                  message={errors["welcome-carer-name"]}
                />
              </div>
              <div>
                <label className="mb-2 block font-bold" htmlFor="welcome-patient-name">
                  Name of the person you support
                </label>
                <input
                  aria-describedby={
                    errors["welcome-patient-name"] ? "welcome-patient-name-error" : undefined
                  }
                  aria-invalid={errors["welcome-patient-name"] ? true : undefined}
                  aria-required="true"
                  autoComplete="off"
                  className={fieldClass}
                  id="welcome-patient-name"
                  onChange={(event) => setPatientName(event.target.value)}
                  type="text"
                  value={patientName}
                />
                <FieldError
                  id="welcome-patient-name-error"
                  message={errors["welcome-patient-name"]}
                />
              </div>
            </div>
            <button
              className="mt-6 min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-on-primary hover:bg-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-on-primary"
              onClick={() => {
                if (!checkOnSubmit()) return;
                start({ carerName: carerName.trim(), patientName: patientName.trim() });
              }}
              type="button"
            >
              Start
            </button>
          </section>

          <section
            aria-labelledby="welcome-example-heading"
            className="rounded-2xl border border-line bg-surface p-6 md:p-7"
          >
            <h2 id="welcome-example-heading" className="text-xl font-bold">
              Or look around first
            </h2>
            <p className="mt-2 text-base leading-7 text-ink-muted">
              Load a made-up week for Asha and her daughter Meera: three medicines, doses given
              and not given, one logged late, and a reminder time that changed part way through.
              Nothing in it is real, and it can be cleared in Settings.
            </p>
            <button
              className="mt-6 min-h-12 w-full rounded-xl border-2 border-accent px-5 font-bold text-accent hover:bg-accent-subtle focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={loadExample}
              type="button"
            >
              Load the example
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
