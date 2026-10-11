// @vitest-environment jsdom
import axe from "axe-core";
import { act } from "react";
import { createRoot, type Root as ReactRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Root } from "./Root";
import { createMemoryRepository } from "./storage/memoryRepository";
import type { Snapshot } from "./storage/repository";
import { seedSnapshot } from "./storage/seed";

// The automated part of the accessibility check: every view and dialog is
// rendered and run through axe. It catches missing names, bad ARIA, broken
// label and heading structure and duplicate landmarks. It does not see layout,
// so it cannot measure colour contrast, and nothing here stands in for the
// keyboard and screen reader passes.

// Thursday morning, between the first dose of the day and the rest.
const now = new Date(2026, 5, 18, 8, 15);

let container: HTMLElement;
let root: ReactRoot;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ now, toFake: ["Date"] });
  window.scrollTo = () => {};
  // axe probes for a canvas, which this environment does not have.
  HTMLCanvasElement.prototype.getContext = () => null;
  // Tailwind is not loaded here, so the two classes that take content out of
  // the page are given by hand. Without a viewport no breakpoint applies, which
  // makes this the phone layout: the mobile navigation is shown and the sidebar
  // is not, as it would be in a browser.
  const style = document.createElement("style");
  style.textContent = ".hidden { display: none; }";
  document.head.append(style);
  document.documentElement.lang = "en-GB";
  document.title = "AccessCare";
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.head.querySelector("style")?.remove();
  vi.useRealTimers();
});

function render(snapshot: Snapshot) {
  root = createRoot(container);
  act(() => root.render(<Root initial={snapshot} repository={createMemoryRepository(snapshot)} />));
}

const nameOf = (element: Element) =>
  (element.getAttribute("aria-label") ?? element.textContent ?? "").replace(/\s+/g, " ").trim();

const shown = (element: Element) => !element.closest(".hidden");

// Presses the first control on screen with this name, as a user would find it.
function press(name: string | RegExp) {
  const control = [...document.querySelectorAll("button, a")].find(
    (element) =>
      shown(element) &&
      (typeof name === "string" ? nameOf(element) === name : name.test(nameOf(element))),
  );
  if (!control) throw new Error(`No control named ${name} is on screen`);
  act(() => (control as HTMLElement).click());
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

describe("every view passes axe", () => {
  it.each([
    ["Dashboard", null],
    ["Prescriptions", "Prescriptions"],
    ["Reminders", "Reminders"],
    ["Medicine log", "Medicine log"],
    ["Emergency contacts", "Emergency contacts"],
    ["Patient setup", "Patient setup"],
    ["Patient view", "Patient view"],
    ["Settings", "Settings"],
  ] as const)("%s", async (_view, navigation) => {
    render(seedSnapshot(now));
    if (navigation) press(navigation);
    expect(heading()).not.toBe("");
    await expectNoViolations();
  });

  it("Help, reached from settings on a phone", async () => {
    render(seedSnapshot(now));
    press("Settings");
    await expectNoViolations();
  });
});

describe("every dialog and failed form passes axe", () => {
  it("add prescription, empty and after a failed save", async () => {
    render(seedSnapshot(now));
    press("Add prescription");
    expect(document.querySelector("[role=dialog]")).not.toBeNull();
    await expectNoViolations();
    // The dialog's own save button is the last one with this name.
    const save = [...document.querySelectorAll("[role=dialog] button")].find(
      (button) => nameOf(button) === "Add prescription",
    ) as HTMLElement;
    act(() => save.click());
    expect(document.querySelectorAll("[role=alert] p, p[role=alert]").length).toBeGreaterThan(0);
    await expectNoViolations();
  });

  it("the not-given reason, empty and after a failed save", async () => {
    render(seedSnapshot(now));
    press(/as not given to/);
    expect(document.querySelector("[role=dialog]")).not.toBeNull();
    await expectNoViolations();
    press("Save to care log");
    expect(document.querySelector("[role=dialog] [aria-invalid=true]")).not.toBeNull();
    await expectNoViolations();
  });

  it("patient setup after a failed save", async () => {
    render(seedSnapshot(now));
    press("Patient setup");
    press("Save patient setup");
    expect(document.querySelector("[aria-invalid=true]")).not.toBeNull();
    await expectNoViolations();
  });
});

describe("a change of view", () => {
  it("moves focus to the new heading and announces the view", () => {
    render(seedSnapshot(now));
    press("Medicine log");
    expect(document.activeElement).toBe(document.querySelector("h1"));
    expect(document.querySelector("[aria-live=polite].sr-only")?.textContent).toBe("Medicine log");
  });
});
