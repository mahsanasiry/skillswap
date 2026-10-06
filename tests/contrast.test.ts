import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** WCAG relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Reads the colour tokens from the real stylesheet, so the test can never drift from it. */
function tokens(selector: string): Record<string, string> {
  const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
  const start = css.indexOf(selector);
  const block = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

const light = tokens(":root {");
const dark = tokens(':root[data-theme="dark"]');

const TEXT = 4.5; // WCAG AA for normal text
const UI = 3; // WCAG AA for the edges of controls and for focus rings

describe.each([
  ["light", light],
  ["dark", dark],
])("colour contrast (%s mode)", (_mode, t) => {
  it("has every token defined", () => {
    for (const name of ["paper", "surface", "ink", "ink-soft", "line", "control", "teach", "teach-soft", "learn", "learn-soft", "focus"]) {
      expect(t[name], name).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it.each([
    ["body text on the page", "ink", "paper"],
    ["body text on cards", "ink", "surface"],
    ["secondary text on the page", "ink-soft", "paper"],
    ["secondary text on cards", "ink-soft", "surface"],
    ["secondary text on the soft teal tag", "ink-soft", "teach-soft"],
    ["teach tags", "teach", "teach-soft"],
    ["teach text on cards", "teach", "surface"],
    ["learn tags", "learn", "learn-soft"],
    ["learn text on cards", "learn", "surface"],
    ["primary button text", "paper", "ink"],
  ])("%s is readable", (_what, fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(TEXT);
  });

  it.each([
    ["the edge of form controls on cards", "control", "surface"],
    ["the edge of form controls on the page", "control", "paper"],
    ["the keyboard focus ring on the page", "focus", "paper"],
    ["the keyboard focus ring on cards", "focus", "surface"],
  ])("%s is visible", (_what, fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(UI);
  });
});

describe("status colours", () => {
  it.each([
    ["error text on a light card", "#b91c1c", light.surface],
    ["error text on a dark card", "#f87171", dark.surface],
    ["rejected badge, light", "#991b1b", "#fee2e2"],
    ["rejected badge, dark", "#fca5a5", "#450a0a"],
  ])("%s is readable", (_what, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(TEXT);
  });
});
