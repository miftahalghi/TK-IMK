#!/usr/bin/env node
/**
 * Memastikan sebuah branch hanya mengubah file di folder fiturnya (CONTRACT.md §2).
 *
 * Pakai:
 *   npm run check:scope -- maps            → bandingkan dengan origin/main (atau main)
 *   npm run check:scope -- maps develop    → bandingkan dengan branch lain
 *   npm run check:scope                    → tebak fitur dari nama branch "fitur/<id>"
 *
 * Keluar dengan kode 1 jika ada file di luar scope.
 */
import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { isAllowed, FEATURE_ALLOWED_EXTRA } from "./scope-rules.mjs";

const sh = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

function listFeatures() {
  const dir = "src/features";
  return readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory());
}

function currentBranch() {
  try {
    return sh("git rev-parse --abbrev-ref HEAD");
  } catch {
    return "";
  }
}

function resolveBase(explicit) {
  const candidates = explicit ? [explicit] : ["origin/main", "main"];
  for (const ref of candidates) {
    try {
      sh(`git rev-parse --verify ${ref}`);
      return ref;
    } catch {
      /* coba berikutnya */
    }
  }
  return null;
}

const [argFeature, argBase] = process.argv.slice(2);
const features = listFeatures();
const branch = currentBranch();
const feature = argFeature ?? branch.match(/^fitur\/([a-z-]+)/)?.[1];

if (!feature || !features.includes(feature)) {
  console.error(`Fitur tidak dikenali: "${feature ?? ""}". Pilihan: ${features.join(", ")}`);
  console.error("Contoh: npm run check:scope -- maps");
  process.exit(2);
}

const base = resolveBase(argBase);
if (!base) {
  console.error("Branch pembanding tidak ditemukan (origin/main atau main). Jalankan `git fetch` dulu.");
  process.exit(2);
}

let changed;
try {
  const mergeBase = sh(`git merge-base ${base} HEAD`);
  const committed = sh(`git diff --name-only ${mergeBase}...HEAD`);
  const working = sh("git diff --name-only HEAD");
  const untracked = sh("git ls-files --others --exclude-standard");
  changed = [...new Set([committed, working, untracked].join("\n").split("\n").filter(Boolean))];
} catch (e) {
  console.error("Gagal membaca perubahan git:", e.message);
  process.exit(2);
}

const outside = changed.filter((f) => !isAllowed(feature, f));

console.log(`Fitur: ${feature} · dibandingkan dengan: ${base} · ${changed.length} file berubah`);
if (outside.length === 0) {
  console.log(`✓ Semua perubahan berada di src/features/${feature}/` + (FEATURE_ALLOWED_EXTRA.length ? " (atau file yang diizinkan)." : "."));
  process.exit(0);
}

console.error(`\n✗ ${outside.length} file di luar scope fitur "${feature}":`);
for (const f of outside) console.error(`   - ${f}`);
console.error(
  "\nKembalikan perubahan itu (git checkout <base> -- <file>), atau jika memang perlu,\n" +
    "tulis usulan di bagian “Usulan perubahan shared” pada deskripsi PR (CONTRACT.md §2).",
);
process.exit(1);
