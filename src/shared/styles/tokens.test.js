/**
 * Menjaga kontras warna token (Shneiderman S2, WCAG 2.1 AA).
 * Kalau seseorang mengubah warna di tokens.css dan kontrasnya turun, tes ini gagal.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");

/** Ambil token dari blok pertama yang cocok dengan selector. */
function block(selector) {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return "";
}

function tokens(text) {
  const out = {};
  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2];
  return out;
}

const light = tokens(block(":root {"));
const dark = { ...light, ...tokens(block(':root[data-theme="dark"]')) };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5;
const UI = 3;

const PAIRS = [
  // [teks/latar depan, latar belakang, minimum]
  ...["baik", "sedang", "tidak-sehat", "sangat-tidak-sehat", "berbahaya", "none"].map((k) => [`--cat-${k}-on`, `--cat-${k}`, TEXT]),
  ...["rendah", "sedang", "tinggi", "sangat-tinggi", "ekstrem"].map((k) => [`--uv-${k}-on`, `--uv-${k}`, TEXT]),
  ["--color-text", "--color-bg", TEXT],
  ["--color-text", "--color-surface", TEXT],
  ["--color-text-muted", "--color-bg", TEXT],
  ["--color-text-muted", "--color-surface", TEXT],
  ["--color-text-muted", "--color-field", TEXT],
  ["--color-accent", "--color-bg", TEXT],
  ["--color-accent", "--color-surface", TEXT],
  ["--color-on-accent", "--color-accent", TEXT],
  ["--color-text", "--color-accent-soft", TEXT],
  ["--color-danger", "--color-bg", TEXT],
  ["--color-danger", "--color-danger-soft", TEXT],
  ["--color-on-danger", "--color-danger", TEXT],
  ["--color-on-toast", "--color-toast", TEXT],
  ["--color-text", "--color-warning-soft", TEXT],
  ["--color-border-strong", "--color-bg", UI],
  ["--color-border-strong", "--color-surface", UI],
  ["--color-focus", "--color-bg", UI],
];

describe.each([
  ["terang", light],
  ["gelap", dark],
])("kontras token mode %s", (_, t) => {
  it.each(PAIRS)("%s di atas %s ≥ %s:1", (fg, bg, min) => {
    expect(t[fg], `token ${fg} tidak ditemukan`).toBeDefined();
    expect(t[bg], `token ${bg} tidak ditemukan`).toBeDefined();
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});
