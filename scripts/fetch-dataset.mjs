#!/usr/bin/env node
/**
 * Mengunduh dataset kualitas udara dari Open-Meteo Air Quality API untuk semua
 * lokasi di src/shared/data/locations.js, lalu menyimpannya ke
 * src/shared/data/dataset/open-meteo.json.
 *
 * Pakai:
 *   npm run fetch:dataset                              → rentang default di bawah
 *   npm run fetch:dataset -- 2026-10-01 2026-11-01     → rentang lain (YYYY-MM-DD)
 *
 * Sumber: https://open-meteo.com/en/docs/air-quality-api (lisensi CC BY 4.0).
 * Model: Copernicus Atmosphere Monitoring Service (CAMS), resolusi puluhan km.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../src/shared/data/locations.js";

const DEFAULT_START = "2026-10-01";
const DEFAULT_END = "2026-11-01";
const VARIABLES = {
  pm2_5: "pm25",
  pm10: "pm10",
  carbon_monoxide: "co",
  nitrogen_dioxide: "no2",
  sulphur_dioxide: "so2",
  uv_index: "uv",
};
const API = "https://air-quality-api.open-meteo.com/v1/air-quality";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "shared", "data", "dataset", "open-meteo.json");

const [start = DEFAULT_START, end = DEFAULT_END] = process.argv.slice(2);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
if (!DATE.test(start) || !DATE.test(end) || start > end) {
  console.error(`Rentang tidak valid: "${start}" s/d "${end}". Format: YYYY-MM-DD YYYY-MM-DD`);
  process.exit(2);
}

const params = new URLSearchParams({
  latitude: LOCATIONS.map((l) => l.lat).join(","),
  longitude: LOCATIONS.map((l) => l.lon).join(","),
  hourly: Object.keys(VARIABLES).join(","),
  timezone: "Asia/Jakarta",
  start_date: start,
  end_date: end,
});

console.log(`Mengunduh ${LOCATIONS.length} lokasi, ${start} s/d ${end} …`);
const res = await fetch(`${API}?${params}`);
const body = await res.json();
if (!res.ok || body.error) {
  console.error(`Gagal: ${body.reason ?? res.statusText}`);
  process.exit(1);
}
const results = Array.isArray(body) ? body : [body];
if (results.length !== LOCATIONS.length) {
  console.error(`Jumlah hasil (${results.length}) tidak sama dengan jumlah lokasi (${LOCATIONS.length}).`);
  process.exit(1);
}

const round1 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : null);
const times = results[0].hourly.time;
const series = {};
let nulls = 0;
results.forEach((r, i) => {
  if (r.hourly.time.length !== times.length || r.hourly.time[0] !== times[0]) {
    console.error(`Deret waktu lokasi ${LOCATIONS[i].id} berbeda dengan lokasi pertama.`);
    process.exit(1);
  }
  const loc = {};
  for (const [api, key] of Object.entries(VARIABLES)) {
    loc[key] = r.hourly[api].map((v) => (key === "co" ? (typeof v === "number" ? Math.round(v) : null) : round1(v)));
    nulls += loc[key].filter((v) => v === null).length;
  }
  series[LOCATIONS[i].id] = { gridLat: r.latitude, gridLon: r.longitude, ...loc };
});

const dataset = {
  source: "Open-Meteo Air Quality API",
  sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
  model: "Copernicus Atmosphere Monitoring Service (CAMS)",
  license: "CC BY 4.0",
  timezone: "Asia/Jakarta",
  start: `${times[0]}:00+07:00`,
  end: `${times[times.length - 1]}:00+07:00`,
  hours: times.length,
  fetchedAt: new Date().toISOString(),
  units: { pm25: "µg/m³", pm10: "µg/m³", co: "µg/m³", no2: "µg/m³", so2: "µg/m³", uv: "" },
  series,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(dataset);
writeFileSync(OUT, json + "\n");
console.log(`✓ ${times.length} jam × ${LOCATIONS.length} lokasi, ${nulls} nilai kosong, ${(json.length / 1024).toFixed(0)} KB`);
console.log(`  Disimpan ke ${OUT}`);
