/**
 * Format angka dan waktu untuk UI (id-ID, zona Asia/Jakarta / WIB).
 * Jakarta tidak memakai DST, jadi konversi cukup +7 jam dari UTC; hasilnya
 * sama di semua browser tanpa bergantung pada data ICU.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const pad = (n) => String(n).padStart(2, "0");

/** Komponen tanggal/jam dalam WIB. */
export function wibParts(input) {
  const d = new Date(new Date(input).getTime() + WIB_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/** "65,2" · null → "–" */
export function formatNumber(value, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "–";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

/** "12.00" */
export function formatTime(iso) {
  const p = wibParts(iso);
  return `${pad(p.hour)}.${pad(p.minute)}`;
}

/** "22 Okt 2026" */
export function formatDate(iso) {
  const p = wibParts(iso);
  return `${p.day} ${MONTHS_SHORT[p.month]} ${p.year}`;
}

/** "22 Okt" */
export function formatShortDate(iso) {
  const p = wibParts(iso);
  return `${p.day} ${MONTHS_SHORT[p.month]}`;
}

/** "Kamis" */
export function formatDay(iso) {
  return DAYS[wibParts(iso).weekday];
}

/** "12.00 · 22 Okt 2026" */
export function formatDateTime(iso) {
  return `${formatTime(iso)} · ${formatDate(iso)}`;
}

/** Kunci tanggal WIB "2026-10-22", berguna untuk mengelompokkan data per hari. */
export function wibDateKey(iso) {
  const p = wibParts(iso);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

/** "65,2 µg/m³" · null → "–" */
export function formatConcentration(value, unit = "µg/m³", digits = 1) {
  const n = formatNumber(value, digits);
  return n === "–" ? n : `${n} ${unit}`;
}
