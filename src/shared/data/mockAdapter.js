/**
 * Adapter data mock. Menghasilkan data deterministik dari (lokasi, jam):
 * nilai untuk jam yang sama selalu sama, jadi current, hourly, dan daily konsisten.
 * Data selalu "terkini" relatif terhadap jam sekarang, sehingga demo terlihat hidup.
 *
 * Adapter lain (realAdapter, Fase 2) wajib mengimplementasikan fungsi yang sama
 * dengan bentuk keluaran yang sama (CONTRACT.md §5).
 */
import { MOCK_LOCATIONS } from "./mock/locations.js";
import { wibDateKey, wibParts } from "../format.js";

const HOUR_MS = 60 * 60 * 1000;
const WIB_OFFSET_MS = 7 * HOUR_MS;

/** PRNG deterministik kecil (mulberry32). */
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round1 = (v) => Math.round(v * 10) / 10;

/** Faktor harian polusi: puncak jam berangkat (07–09) dan pulang (17–20), terendah dini hari & siang. */
function trafficFactor(hour) {
  const morning = Math.exp(-((hour - 8) ** 2) / 4);
  const evening = Math.exp(-((hour - 18.5) ** 2) / 5);
  const night = hour < 5 ? -0.15 : 0;
  return 0.7 + 0.55 * morning + 0.6 * evening + night;
}

/** Variasi antarhari (cuaca, angin) supaya tujuh hari tidak sama. */
function dayFactor(locId, dateKey) {
  const r = rng(hashString(`${locId}|${dateKey}`));
  return { pollution: 0.75 + r() * 0.5, sky: 0.55 + r() * 0.45 };
}

/** Awal jam (UTC ms) untuk sebuah waktu. */
function hourStart(ms) {
  return Math.floor(ms / HOUR_MS) * HOUR_MS;
}

/** Satu Reading untuk lokasi + awal jam (ms). */
export function readingAt(location, startMs) {
  const iso = new Date(startMs).toISOString();
  const { hour } = wibParts(iso);
  const dateKey = wibDateKey(iso);
  const day = dayFactor(location.id, dateKey);
  const r = rng(hashString(`${location.id}|${startMs}`));
  const noise = () => 0.9 + r() * 0.2;

  const pm25 = location.profile.pm25 * trafficFactor(hour) * day.pollution * noise();
  const sun = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const uv = location.profile.uvPeak * sun * day.sky * noise();

  const reading = {
    locationId: location.id,
    time: toWibIso(startMs),
    pm25: round1(pm25),
    pm10: round1(pm25 * 1.55 * noise()),
    co: Math.round((500 + pm25 * 28) * noise()),
    no2: round1((12 + pm25 * 0.55) * noise()),
    so2: round1((6 + pm25 * 0.22) * noise()),
    uv: round1(uv),
  };
  for (const key of location.profile.missing ?? []) reading[key] = null;
  return reading;
}

/** ISO 8601 dengan offset +07:00, misalnya "2026-10-22T12:00:00+07:00". */
function toWibIso(ms) {
  return new Date(ms + WIB_OFFSET_MS).toISOString().replace(/\.\d{3}Z$/, "+07:00");
}

/** Awal hari WIB (UTC ms) untuk sebuah waktu. */
function wibDayStart(ms) {
  const wib = ms + WIB_OFFSET_MS;
  return Math.floor(wib / (24 * HOUR_MS)) * 24 * HOUR_MS - WIB_OFFSET_MS;
}

const avg = (values) => {
  const nums = values.filter((v) => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

/**
 * @param {{ now?: () => number, latency?: [number, number] }} options
 */
export function createMockAdapter({ now = () => Date.now(), latency = [200, 600] } = {}) {
  const byId = new Map(MOCK_LOCATIONS.map((l) => [l.id, l]));

  const wait = () => {
    const [min, max] = latency;
    if (!max) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
  };

  const find = (locationId) => {
    const loc = byId.get(locationId);
    if (!loc) throw new Error(`Lokasi "${locationId}" tidak ditemukan.`);
    return loc;
  };

  // eslint-disable-next-line no-unused-vars
  const publicLocation = ({ profile, ...rest }) => rest;

  return {
    kind: "mock",
    async getSourceInfo() {
      return {
        kind: "mock",
        label: "Data simulasi",
        hasForecast: true,
        updatedAt: toWibIso(hourStart(now())),
        description: "Angka di situs ini masih data contoh untuk pengembangan, belum hasil pengukuran asli.",
      };
    },
    async getLocations() {
      await wait();
      return MOCK_LOCATIONS.map(publicLocation);
    },
    async getCurrent(locationId) {
      await wait();
      return readingAt(find(locationId), hourStart(now()));
    },
    async getCurrentAll() {
      await wait();
      const start = hourStart(now());
      return MOCK_LOCATIONS.map((loc) => readingAt(loc, start));
    },
    async getHourly(locationId, { hours = 24 } = {}) {
      await wait();
      const loc = find(locationId);
      const start = hourStart(now());
      return Array.from({ length: hours }, (_, i) => readingAt(loc, start + i * HOUR_MS));
    },
    async getDaily(locationId, { days = 7 } = {}) {
      await wait();
      const loc = find(locationId);
      const today = wibDayStart(now());
      return Array.from({ length: days }, (_, d) => {
        const dayStart = today + d * 24 * HOUR_MS;
        const hours = Array.from({ length: 24 }, (_, h) => readingAt(loc, dayStart + h * HOUR_MS));
        const mean = (key) => {
          const v = avg(hours.map((x) => x[key]));
          return v === null ? null : key === "co" ? Math.round(v) : round1(v);
        };
        const uvMax = Math.max(...hours.map((x) => x.uv ?? 0));
        return {
          locationId: loc.id,
          time: toWibIso(dayStart),
          pm25: mean("pm25"),
          pm10: mean("pm10"),
          co: mean("co"),
          no2: mean("no2"),
          so2: mean("so2"),
          uv: round1(uvMax),
        };
      });
    },
  };
}
