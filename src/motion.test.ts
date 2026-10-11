import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Reduced motion is decided in the stylesheet and nowhere else. These hold
// that in place: a scroll or animation driven from script would follow
// neither the device's preference nor the in-app setting.

const here = new URL(".", import.meta.url);
const css = readFileSync(new URL("index.css", here), "utf8");

const sources = (readdirSync(here, { recursive: true }) as string[])
  .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"))
  .map((file) => ({ file, text: readFileSync(new URL(file, here), "utf8") }));

const rule = (selector: string) => {
  const start = css.indexOf(selector);
  expect(start, `${selector} is in index.css`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}\n", start));
};

const stopsEverything = (body: string) => {
  expect(body).toContain("scroll-behavior: auto !important");
  expect(body).toContain("transition-duration: 0.01ms !important");
  expect(body).toContain("animation-duration: 0.01ms !important");
};

describe("reduced motion", () => {
  it("is honoured from the device preference, in CSS", () => {
    stopsEverything(rule("@media (prefers-reduced-motion: reduce)"));
  });

  it("is honoured from the in-app setting, in CSS, including on the root element", () => {
    const body = rule("html[data-reduced-motion],");
    expect(body).toContain("html[data-reduced-motion] *");
    stopsEverything(body);
  });

  it("does not depend on the in-app setting being read by the media query, or the reverse", () => {
    const media = rule("@media (prefers-reduced-motion: reduce)");
    expect(media).not.toContain("data-reduced-motion");
  });

  it("leaves every scroll to the stylesheet", () => {
    const scripted = sources.filter(({ text }) => /behavior\s*:|scrollIntoView|\.animate\(/.test(text));
    expect(scripted.map(({ file }) => file)).toEqual([]);
  });

  it("has no motion that is not a Tailwind transition or the one smooth scroll", () => {
    expect(css).not.toContain("@keyframes");
    const animated = sources.filter(({ text }) => /\banimate-|\bduration-\d|\bdelay-\d/.test(text));
    expect(animated.map(({ file }) => file)).toEqual([]);
  });
});
