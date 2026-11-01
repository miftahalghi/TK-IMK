/**
 * Aturan scope per fitur. Dipisah dari check-scope.mjs supaya bisa dites.
 */

/** File di luar folder fitur yang boleh diubah oleh fitur mana pun. Biarkan kosong kecuali disepakati. */
export const FEATURE_ALLOWED_EXTRA = [];

/** Normalisasi path git (selalu "/"). */
const norm = (p) => p.replace(/\\/g, "/").replace(/^\.\//, "");

/** true jika `file` boleh diubah oleh branch fitur `feature`. */
export function isAllowed(feature, file) {
  const f = norm(file);
  if (f.startsWith(`src/features/${feature}/`)) return true;
  return FEATURE_ALLOWED_EXTRA.includes(f);
}
