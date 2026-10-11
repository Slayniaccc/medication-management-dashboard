// @vitest-environment jsdom
import axe from "axe-core";
import { act } from "react";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Root } from "./Root";
import { createMemoryRepository } from "./storage/memoryRepository";
import type { Repository, Snapshot } from "./storage/repository";
import { emptySnapshot, exampleSnapshot } from "./storage/snapshots";

// The automated part of the accessibility check: every view and dialog is
// rendered and run through axe, with the example loaded and with nothing
// entered. It catches missing names, bad ARIA, broken label and heading
// structure and duplicate landmarks. It does not see layout, so it cannot
// measure colour contrast (contrast.test.ts does that from the tokens), and
// nothing here stands in for the keyboard and screen reader passes.

// Thursday morning, after the first dose of the day is due and before the rest.
const now = new Date(2026, 5, 18, 8, 15);

let container: HTMLElement;
let root: ReactRoot;
let repository: Repository;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ now, toFake: ["Date"] });
  window.scrollTo = () => {};
  // axe probes for a canvas, which this environment does not have.
  HTMLCanvasElement.prototype.getContext = () => null;
  // Enough of a modal dialog for the markup to be checked. Focus trapping and
  // Escape are the browser's own and are not what is being tested here.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
    (this.querySelector("button, input, select") as HTMLElement | null)?.focus();
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
  // Tailwind is not loaded here, so the class that takes content out of the
  // page is given by hand. Without a viewport no breakpoint applies, which
  // makes this the phone layout: the mobile navigation is shown and the sidebar
  // is not, as it would be in a browser.
  const style = document.createElement("style");
  style.textContent = ".hidden { display: none; }";
  document.head.append(style);
  document.documentElement.lang = "en-GB";
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.head.querySelector("style")?.remove();
  vi.useRealTimers();
});

async function render(snapshot: Snapshot) {
  repository = createMemoryRepository(snapshot);
  root = createRoot(container);
  await act(async () => root.render(<Root initial={snapshot} repository={repository} />));
}

const nameOf = (element: Element) =>
  (element.getAttribute("aria-label") ?? element.textContent ?? "").replace(/\s+/g, " ").trim();

const shown = (element: Element) => !element.closest(".hidden");

// Presses the first control on screen with this name, as a user would find it.
async function press(name: string | RegExp) {
  const control = [...document.querySelectorAll("button, a")].find(
    (element) =>
      shown(element) &&
      (typeof name === "string" ? nameOf(element) === name : name.test(nameOf(element))),
  );
  if (!control) throw new Error(`No control named ${name} is on screen`);
  // Async, because loading and clearing the example wait on the repository.
  await act(async () => (control as HTMLElement).click());
}

function type(id: string, value: string) {
  const field = document.getElementById(id) as HTMLInputElement;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setValue.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function expectNoViolations() {
  const results = await axe.run(document.body, {
    runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    rules: {
      // Needs real layout and computed colours, which this environment lacks.
      "color-contrast": { enabled: false },
    },
  });
  const found = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help}\n` +
      violation.nodes.map((node) => `    ${node.target.join(" ")}`).join("\n"),
  );
  expect(found, found.join("\n")).toEqual([]);
}

const heading = () => document.querySelector("h1")?.textContent ?? "";
const announced = () => document.querySelector("[aria-live=polite].sr-only")?.textContent;

const views = [
  "Dashboard",
  "Prescriptions",
  "Reminders",
  "Medicine log",
  "Patient setup",
  "Patient view",
  "Your details",
  "Settings",
  "Help",
] as const;

describe("the check itself", () => {
  it("fails on a control with no name, so a pass elsewhere means something", async () => {
    root = createRoot(container);
    act(() =>
      root.render(
        <main>
          <h1>Broken on purpose</h1>
          <button type="button">
            <svg aria-hidden="true" />
          </button>
        </main>,
      ),
    );
    await expect(expectNoViolations()).rejects.toThrow(/button-name/);
  });
});

describe("every view passes axe with the example loaded", () => {
  it.each(views)("%s", async (view) => {
    await render(exampleSnapshot(now));
    if (view !== "Dashboard") await press(view);
    expect(heading()).not.toBe("");
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelectorAll("main")).toHaveLength(1);
    await expectNoViolations();
  });
});

describe("every view passes axe with nothing entered but two names", () => {
  it("the welcome page, empty and after a failed start", async () => {
    await render(emptySnapshot());
    expect(heading()).toBe("Welcome to AccessCare");
    await expectNoViolations();
    await press("Start");
    expect(document.activeElement?.id).toBe("welcome-carer-name");
    expect(document.querySelectorAll("[role=alert][id]")).toHaveLength(2);
    await expectNoViolations();
  });

  it.each(views)("%s", async (view) => {
    await render(emptySnapshot());
    type("welcome-carer-name", "Sam");
    type("welcome-patient-name", "Jo");
    await press("Start");
    if (view !== "Dashboard") await press(view);
    expect(heading()).not.toBe("");
    await expectNoViolations();
  });
});

describe("every dialog and failed form passes axe", () => {
  it("add prescription, empty and after a failed save", async () => {
    await render(exampleSnapshot(now));
    await press("Add prescription");
    const dialog = document.querySelector("dialog[open]")!;
    expect(dialog).not.toBeNull();
    await expectNoViolations();
    const save = [...dialog.querySelectorAll("button")].find(
      (button) => nameOf(button) === "Add prescription",
    )!;
    act(() => save.click());
    expect(document.activeElement?.id).toBe("prescription-name");
    expect(dialog.querySelectorAll("[aria-invalid=true]").length).toBe(4);
    await expectNoViolations();
  });

  it("the not-given reason in the carer's words, empty and after a failed save", async () => {
    await render(exampleSnapshot(now));
    await press(/^Not given: log the 8:00 AM dose/);
    expect(document.querySelector("dialog[open] h2")?.textContent).toBe(
      "Why was this dose not given?",
    );
    await expectNoViolations();
    await press("Log as not given");
    expect(document.querySelector("dialog[open] [aria-invalid=true]")).not.toBeNull();
    await expectNoViolations();
  });

  it("the not-given reason in the patient's words, inside the patient view's theme", async () => {
    const snapshot = exampleSnapshot(now);
    await render({ ...snapshot, details: { ...snapshot.details, allowMedicineChanges: true } });
    await press("Patient view");
    await press("I did not take it");
    const dialog = document.querySelector("dialog[open]")!;
    expect(dialog.querySelector("h2")?.textContent).toBe("Why did you not take it?");
    expect(dialog.closest("[data-theme=high-contrast]")).not.toBeNull();
    await expectNoViolations();
  });

  it("patient setup after a failed save", async () => {
    await render(emptySnapshot());
    type("welcome-carer-name", "Sam");
    type("welcome-patient-name", "Jo");
    await press("Start");
    await press("Patient setup");
    await press("Save patient setup");
    expect(document.querySelector("[aria-invalid=true]")).not.toBeNull();
    await expectNoViolations();
  });

  it("removing a prescription asks first, and the question passes axe", async () => {
    await render(exampleSnapshot(now));
    await press("Prescriptions");
    await press("Remove Medicine 3");
    await expectNoViolations();
  });

  it("clearing the example asks first, and the question passes axe", async () => {
    await render(exampleSnapshot(now));
    await press("Settings");
    await press("Clear the example and start with my own");
    await expectNoViolations();
  });
});

describe("a change of view", () => {
  it("moves focus to the new heading, announces the view and names it in the title", async () => {
    await render(exampleSnapshot(now));
    await press("Medicine log");
    expect(document.activeElement).toBe(document.querySelector("h1"));
    expect(announced()).toBe("Medicine log");
    expect(document.title).toBe("Medicine log · AccessCare");
  });

  it("does the same when the example is loaded and when it is cleared", async () => {
    await render(emptySnapshot());
    await press("Load the example");
    expect(heading()).toContain("Meera");
    expect(document.activeElement).toBe(document.querySelector("h1"));
    expect(announced()).toBe("Dashboard");

    await press("Settings");
    await press("Clear the example and start with my own");
    await press("Clear the example");
    expect(heading()).toBe("Welcome to AccessCare");
    expect(document.activeElement).toBe(document.querySelector("h1"));
    expect(announced()).toBe("Welcome");
    expect((await repository.load()).medications).toEqual([]);
  });
});

describe("focus is never dropped by the action that was just taken", () => {
  it("goes to the outcome when a dose is logged as given", async () => {
    await render(exampleSnapshot(now));
    await press(/^Given: log the 8:00 AM dose of Medicine 1/);
    expect(document.activeElement?.textContent).toContain("Medicine 1, 8:00 AM: Given");
    expect(document.querySelector("[role=status]")?.textContent).toBe("Dose logged as given.");
  });

  it("goes to the outcome when a dose is logged as not given, and the reason is stored", async () => {
    await render(exampleSnapshot(now));
    await press(/^Not given: log the 8:00 AM dose/);
    act(() => (document.getElementById("reason-asleep") as HTMLElement).click());
    await press("Log as not given");
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement?.textContent).toContain("Medicine 1, 8:00 AM: Not given");
    const stored = (await repository.load()).events.find(
      (event) => event.date === "2026-06-18" && event.timeOfDay === "08:00",
    );
    expect(stored).toMatchObject({ outcome: "not-given", reason: "asleep", recordedBy: "carer" });
  });

  it("goes to the safe answer when asked to remove, and to add back once removed", async () => {
    await render(exampleSnapshot(now));
    await press("Prescriptions");
    await press("Remove Medicine 3");
    expect(nameOf(document.activeElement!)).toBe("Keep Medicine 3");
    await press("Keep Medicine 3");
    expect(nameOf(document.activeElement!)).toBe("Remove Medicine 3");

    await press("Remove Medicine 3");
    // The confirming button carries the name too, and is the last so named.
    const confirm = [...document.querySelectorAll("button")]
      .filter((button) => nameOf(button) === "Remove Medicine 3")
      .at(-1)!;
    act(() => confirm.click());
    expect(nameOf(document.activeElement!)).toBe("Add back Medicine 3");

    // Nothing was deleted: the medicine and its logged doses are still stored.
    const afterRemoving = await repository.load();
    expect(afterRemoving.medications).toHaveLength(3);
    expect(
      afterRemoving.events.filter((event) => event.medicationId === "example-medicine-3"),
    ).toHaveLength(6);

    await press("Add back Medicine 3");
    expect(nameOf(document.activeElement!)).toBe("Remove Medicine 3");
    // The ended schedule stays ended and a new one starts today.
    const schedules = (await repository.load()).schedules.filter(
      (schedule) => schedule.medicationId === "example-medicine-3",
    );
    expect(schedules.map((schedule) => [schedule.startDate, schedule.endDate])).toEqual([
      ["2026-06-12", "2026-06-18"],
      ["2026-06-18", null],
    ]);
  });
});

describe("read aloud", () => {
  it("is off until the carer turns it on, so it cannot talk over a screen reader", async () => {
    expect(emptySnapshot().details.readAloud).toBe(false);
    expect(exampleSnapshot(now).details.readAloud).toBe(false);
    await render(exampleSnapshot(now));
    await press("Patient view");
    expect(document.body.textContent).not.toContain("aloud");
  });
});
