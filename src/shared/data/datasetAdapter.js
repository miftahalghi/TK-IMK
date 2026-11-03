/**
 * Adapter data rekaman Open-Meteo (src/shared/data/dataset/open-meteo.json).
 * Bentuk keluarannya sama persis dengan mockAdapter (CONTRACT.md §5), jadi fitur
 * tidak perlu berubah saat sumber data diganti.
 *
 * "Sekarang" di mode ini adalah satu waktu tetap di dalam rekaman (DATASET_NOW),
 * supaya data per jam (24 jam ke depan) dan per hari (7 hari ke depan) tetap tersedia
 * dan angka yang tampil selalu sama saat demo dan uji usability.
 * Defaultnya: hari ketujuh dari akhir rekaman, pukul 12.00 WIB.
 * Bisa diganti lewat .env: VITE_DATASET_NOW=2026-10-20T08:00
 */
import { LOCATIONS } from "./locations.js";
import { formatDate, formatTime } from "../format.js";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WIB_OFFSET_MS = 7 * HOUR_MS;
const KEYS = ["pm25", "pm10", "co", "no2", "so2", "uv"];

const toWibIso = (ms) => new Date(ms + WIB_OFFSET_MS).toISOString().replace(/\.\d{3}Z$/, "+07:00");
const wibDayStart = (ms) => Math.floor((ms + WIB_OFFSET_MS) / DAY_MS) * DAY_MS - WIB_OFFSET_MS;
const round1 = (v) => Math.round(v * 10) / 10;

/** Parse "2026-10-26T12:00" (dianggap WIB) atau ISO lengkap. */
function parseWib(text) {
  if (!text) return NaN;
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text.length === 16 ? `${text}:00` : text}+07:00`;
  return Date.parse(iso);
}

/** Waktu "sekarang" default: hari ketujuh dari akhir rekaman, pukul 12.00 WIB. */
export function defaultNow(dataset) {
  const lastDay = wibDayStart(Date.parse(dataset.end));
  return lastDay - 6 * DAY_MS + 12 * HOUR_MS;
}

/**
 * @param {{ load?: () => Promise<object>, now?: string, latency?: [number, number] }} options
 *   load: memuat dataset (default: impor JSON secara terpisah supaya tidak membebani mode mock)
 *   now:  waktu "sekarang" di dalam rekaman, misalnya "2026-10-26T12:00"
 */
export function createDatasetAdapter({
  load = () => import("./dataset/open-meteo.json").then((m) => m.default ?? m),
  now,
  latency = [0, 0],
} = {}) {
  let cache = null;

  const wait = () => {
    const [min, max] = latency;
    if (!max) return Promise.resolve();
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
  };

  async function state() {
    if (cache) return cache;
    const dataset = await load();
    const startMs = Date.parse(dataset.start);
    const endMs = Date.parse(dataset.end);
    let nowMs = Math.floor(parseWib(now) / HOUR_MS) * HOUR_MS;
    if (!Number.isFinite(nowMs) || nowMs < startMs || nowMs > endMs) {
      if (now) console.warn(`VITE_DATASET_NOW="${now}" di luar rekaman ${dataset.start} s/d ${dataset.end}. Memakai default.`);
      nowMs = defaultNow(dataset);
    }
    cache = { dataset, startMs, endMs, nowMs };
    return cache;
  }

  function seriesFor(dataset, locationId) {
    const s = dataset.series[locationId];
    if (!s) throw new Error(`Lokasi "${locationId}" tidak ditemukan.`);
    return s;
  }

  /** Reading pada indeks jam ke-i, atau null jika di luar rekaman. */
  function readingAt({ dataset, startMs }, locationId, ms) {
    const i = Math.round((ms - startMs) / HOUR_MS);
    if (i < 0 || i >= dataset.hours) return null;
    const s = seriesFor(dataset, locationId);
    const r = { locationId, time: toWibIso(ms) };
    for (const k of KEYS) r[k] = s[k][i] ?? null;
    return r;
  }

  return {
    kind: "dataset",
    async getSourceInfo() {
      const { dataset, nowMs } = await state();
      return {
        kind: "dataset",
        label: "Rekaman Open-Meteo",
        hasForecast: true,
        updatedAt: toWibIso(nowMs),
        range: { start: dataset.start, end: dataset.end },
        description:
          `Data dari Open-Meteo (model Copernicus CAMS) untuk ${formatDate(dataset.start)} s/d ${formatDate(dataset.end)}. ` +
          `Situs ini menganggap “sekarang” adalah ${formatDate(toWibIso(nowMs))}, ${formatTime(toWibIso(nowMs))} WIB. ` +
          "Nilai satu lokasi mewakili wilayah sekitarnya (puluhan kilometer), bukan satu titik di kota.",
      };
    },
    async getLocations() {
      await wait();
      const { dataset } = await state();
      return LOCATIONS.filter((l) => dataset.series[l.id]).map((l) => ({ ...l }));
    },
    async getCurrent(locationId) {
      await wait();
      const st = await state();
      seriesFor(st.dataset, locationId);
      return readingAt(st, locationId, st.nowMs);
    },
    async getCurrentAll() {
      await wait();
      const st = await state();
      return LOCATIONS.filter((l) => st.dataset.series[l.id]).map((l) => readingAt(st, l.id, st.nowMs));
    },
    async getHourly(locationId, { hours = 24 } = {}) {
      await wait();
      const st = await state();
      seriesFor(st.dataset, locationId);
      const out = [];
      for (let h = 0; h < hours; h += 1) {
        const r = readingAt(st, locationId, st.nowMs + h * HOUR_MS);
        if (!r) break; // akhir rekaman
        out.push(r);
      }
      return out;
    },
    async getDaily(locationId, { days = 7 } = {}) {
      await wait();
      const st = await state();
      seriesFor(st.dataset, locationId);
      const today = wibDayStart(st.nowMs);
      const out = [];
      for (let d = 0; d < days; d += 1) {
        const dayStart = today + d * DAY_MS;
        const hours = [];
        for (let h = 0; h < 24; h += 1) {
          const r = readingAt(st, locationId, dayStart + h * HOUR_MS);
          if (r) hours.push(r);
        }
        if (hours.length === 0) break; // akhir rekaman
        const day = { locationId, time: toWibIso(dayStart) };
        for (const k of KEYS) {
          const vals = hours.map((x) => x[k]).filter((v) => typeof v === "number");
          if (vals.length === 0) day[k] = null;
          else if (k === "uv") day[k] = round1(Math.max(...vals));
          else if (k === "co") day[k] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          else day[k] = round1(vals.reduce((a, b) => a + b, 0) / vals.length);
        }
        out.push(day);
      }
      return out;
    },
  };
}
