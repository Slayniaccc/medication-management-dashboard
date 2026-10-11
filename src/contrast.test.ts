import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Contrast is checked from the colour tokens themselves. Every screen takes
// its colours from src/index.css and nowhere else, so the pairs below are the
// whole of what can be put next to what. Each is checked in all three themes,
// with colour-safe mode on and off.
//
// Text size is covered by the thresholds rather than by more combinations: the
// setting changes sizes and no colours, and every text pair is held to the
// 4.5:1 body figure whatever size it is drawn at. Nothing here uses the 3:1
// allowance for large text, so the result is the same at standard, large and
// extra large.
//
// This reads values, not pixels. It does not know about text over a photo or a
// translucent layer, and it is only as complete as the list of pairs.

const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");

type Tokens = Record<string, string>;

function block(selector: string): Tokens {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) throw new Error(`No ${selector} block in index.css`);
  const body = css.slice(start, css.indexOf("}", start));
  const tokens: Tokens = {};
  for (const [, name, value] of body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/g)) {
    tokens[name] = value;
  }
  return tokens;
}

// The cascade as the browser applies it: defaults, then the theme, then
// colour-safe, then the rule for that theme with colour-safe.
function tokensFor(theme: "light" | "high-contrast" | "dark", colourSafe: boolean): Tokens {
  const themed = theme === "light" ? {} : block(`[data-theme="${theme}"]`);
  return {
    ...block("@theme"),
    ...themed,
    ...(colourSafe ? block("[data-colour-safe]") : {}),
    ...(colourSafe && theme !== "light" ? block(`[data-theme="${theme}"][data-colour-safe]`) : {}),
  };
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const channel = parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT = 4.5;
const UI = 3;

// [foreground, backgrounds it is drawn on, minimum, what it is]
const pairs: Array<[string, string[], number, string]> = [
  ["ink", ["page", "surface", "surface-muted", "surface-sunken"], TEXT, "main text"],
  ["ink", ["accent-subtle", "accent-soft", "danger-subtle"], TEXT, "text on tinted panels"],
  ["ink-soft", ["page", "surface", "surface-muted", "surface-sunken"], TEXT, "secondary text"],
  ["ink-soft", ["accent-subtle", "accent-soft"], TEXT, "secondary text on tinted panels"],
  ["ink-muted", ["page", "surface", "surface-muted", "surface-sunken", "accent-subtle"], TEXT, "hints and captions"],
  ["accent", ["page", "surface", "surface-muted", "accent-subtle", "accent-soft"], TEXT, "accent text and outlined buttons"],
  ["on-primary", ["primary", "primary-hover"], TEXT, "filled buttons"],
  ["on-inverse", ["inverse"], TEXT, "sidebar and toast"],
  ["on-inverse-muted", ["inverse"], TEXT, "sidebar items"],
  ["inverse", ["on-inverse"], TEXT, "current sidebar item"],
  ["on-highlight", ["highlight"], TEXT, "overdue label, storage notice, save bar"],
  ["danger", ["surface", "page", "danger-subtle"], TEXT, "errors and remove buttons"],
  ["on-danger", ["danger"], TEXT, "confirm remove"],
  ["given", ["given-subtle", "surface"], TEXT, "given and taken"],
  ["not-given", ["not-given-subtle", "surface"], TEXT, "not given and not taken"],

  ["line-strong", ["page", "surface", "surface-muted", "surface-sunken"], UI, "field and button borders, switch knob when off"],
  ["accent", ["surface", "page", "surface-sunken"], UI, "outlined button border, switch when on"],
  ["surface", ["accent"], UI, "switch knob when on"],
  ["danger", ["surface"], UI, "invalid field border"],
  ["given", ["surface", "page"], UI, "given border"],
  ["not-given", ["surface", "page"], UI, "not given border"],
  ["on-med", ["med-coral", "med-teal", "med-ochre", "med-indigo"], UI, "medicine tile icon"],

  // A focus ring is drawn outside its control with a gap, so what it has to
  // stand out from is the surface around the control.
  ["focus", ["page", "surface", "surface-muted", "surface-sunken", "accent-subtle"], UI, "focus ring"],
  ["focus-on-primary", ["page", "surface", "surface-muted", "accent-soft", "accent-subtle", "danger-subtle"], UI, "focus ring around a filled button"],
  ["focus-inverse", ["inverse"], UI, "focus ring in the sidebar"],
  ["on-inverse", ["inverse"], UI, "focus ring on the save bar"],
];

const combinations = (["light", "high-contrast", "dark"] as const).flatMap((theme) =>
  [false, true].map((colourSafe) => ({ theme, colourSafe })),
);

describe("the contrast arithmetic", () => {
  it("gives the known answers", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(ratio("#ffffff", "#ffffff")).toBe(1);
    // The usual example of the lightest grey that passes on white.
    expect(ratio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#777777", "#ffffff")).toBeLessThan(4.5);
  });

  it("reads each theme's own values", () => {
    expect(tokensFor("light", false).page).toBe("#f7f6f1");
    expect(tokensFor("dark", false).page).not.toBe(tokensFor("light", false).page);
    expect(tokensFor("light", true).given).not.toBe(tokensFor("light", false).given);
    expect(tokensFor("dark", true).given).not.toBe(tokensFor("light", true).given);
  });
});

describe.each(combinations)("contrast in $theme, colour-safe $colourSafe", ({ theme, colourSafe }) => {
  const tokens = tokensFor(theme, colourSafe);

  it.each(pairs)("%s on %j is at least %d:1 (%s)", (foreground, backgrounds, minimum) => {
    const failures = backgrounds.flatMap((background) => {
      const found = ratio(tokens[foreground], tokens[background]);
      return found >= minimum
        ? []
        : [`${foreground} ${tokens[foreground]} on ${background} ${tokens[background]} is ${found.toFixed(2)}:1`];
    });
    expect(failures, failures.join("\n")).toEqual([]);
  });
});

describe("colour-safe mode", () => {
  it.each(["light", "high-contrast", "dark"] as const)(
    "moves given and not given off red and green in %s",
    (theme) => {
      const channels = (hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
      const safe = tokensFor(theme, true);
      // Blue, not green, for given; and orange, so not pure red, for not given.
      const [, givenGreen, givenBlue] = channels(safe.given);
      expect(givenBlue).toBeGreaterThan(givenGreen);
      const [notGivenRed, notGivenGreen, notGivenBlue] = channels(safe["not-given"]);
      expect(notGivenRed).toBeGreaterThan(notGivenBlue);
      expect(notGivenGreen).toBeGreaterThan(notGivenBlue);
    },
  );
});
